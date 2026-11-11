import { writeTransaction } from '#core/database/database-write.js';
import { ApplicationError } from '#core/http/application-error.js';
import { Inject, Injectable, HttpStatus } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import type { EntityManager } from 'typeorm';
import {
  LOG_PROVIDER,
  LogService,
} from '#core/logging/services/log.service.js';
import { AdminAuthorizationService } from '#shared/admin-authorization/admin-authorization.service.js';
import {
  authorizedDepartments,
  canManageLecturerProfile,
  hasPrivilege,
} from '#shared/admin-authorization/privilege.js';
import type {
  AdminAccess,
  Privilege,
} from '#shared/admin-authorization/privilege.js';
import { AccountAuthChangedEvent } from '#shared/auth/user.contracts.js';
import type {
  CreateStudentDto,
  PlacementDto,
} from '#shared/auth/student-account.dto.js';
import type { UserResponseDto } from '#shared/auth/user-response.dto.js';
import { hashPassword, matchesPassword } from '#shared/auth/password.js';
import { parsePopulation } from '#shared/http/directory.dto.js';
import type { DirectoryQueryDto } from '#shared/http/directory.dto.js';
import type { Student } from '#modules/student/entity/students.entity.js';
import type { MatricNumSystem } from '#modules/student/entity/matric-num-systems.entity.js';
import type { Admin } from '#modules/admin/entity/admins.entity.js';
import { User } from '../entity/users.entity.js';
import { StudentPlacementService } from './student-placement.service.js';
import { redactResultNotes } from './redact-result-notes.js';
import { USER_REPOSITORY } from '../util/constants.js';
import type { IUserRepository } from '../repositories/user.repository.js';

@Injectable()
export class UserAdministrationService {
  constructor(
    private readonly database: DataSource,
    private readonly auth: AdminAuthorizationService,
    private readonly placement: StudentPlacementService,
    private readonly events: EventBus,
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(LOG_PROVIDER) private readonly log: LogService,
  ) {
    log.setContext(UserAdministrationService.name);
  }

  async createStudent(
    input: CreateStudentDto,
    actorUserId?: string,
  ): Promise<UserResponseDto> {
    const hashedPassword = await hashPassword(input.password);
    const email = accountEmail(input.email);
    const created = await writeTransaction(this.database, async (manager) => {
      const placement = await this.placement.resolve(
        manager,
        input,
        Boolean(actorUserId),
      );
      if (actorUserId)
        await this.auth.require(
          actorUserId,
          'create_student',
          placement.departmentId,
          manager,
        );
      const repository = manager.getRepository(User);
      const account = await repository.save(
        repository.create({
          email,
          hashedPassword,
          role: 'student',
          firstName: input.firstName ?? null,
          lastName: input.lastName ?? null,
        }),
      );
      const students = manager.getRepository<Student>('Student');
      const student = await students.save(
        students.create({ userId: account.id, ...placement }),
      );
      const matricNumber = await this.placement.issueMatriculation(
        manager,
        student,
      );
      return {
        ...userView(account),
        student: studentView(student, matricNumber),
      };
    });
    this.log.log('Student account created', {
      userId: created.id,
      actorUserId,
    });
    return created;
  }

  get(
    userId: string,
    actorUserId?: string,
    populate?: string,
  ): Promise<UserResponseDto> {
    return this.database.transaction('REPEATABLE READ', (manager) =>
      this.readAccount(manager, userId, actorUserId, populate),
    );
  }

  private async readAccount(
    manager: EntityManager,
    userId: string,
    actorUserId?: string,
    populate?: string,
  ): Promise<UserResponseDto> {
    const relations = parsePopulation(populate, ['student', 'admin']);
    const account = await manager.getRepository(User).findOneBy({ id: userId });
    if (!account)
      throw new ApplicationError(HttpStatus.NOT_FOUND, 'Account was not found');
    if (!actorUserId)
      return this.readView(manager, account, new Set(['student', 'admin']));
    const access = await this.auth.resolve(actorUserId, manager);
    const departmentId = await this.departmentOf(manager, account);
    if (!hasPrivilege(access, 'read_user', departmentId))
      throw new ApplicationError(HttpStatus.NOT_FOUND, 'Account was not found');
    if (!hasPrivilege(access, 'read_admin')) relations.delete('admin');
    return this.readView(manager, account, relations, access);
  }

  list(actorUserId: string, input: DirectoryQueryDto) {
    return this.database.transaction('REPEATABLE READ', (manager) =>
      this.listAccounts(manager, actorUserId, input),
    );
  }

  private async listAccounts(
    manager: EntityManager,
    actorUserId: string,
    input: DirectoryQueryDto,
  ) {
    const access = await this.auth.requireAnyScope(
      actorUserId,
      'read_user',
      manager,
    );
    const scopes = authorizedDepartments(access, 'read_user');
    const relations = parsePopulation(input.populate, ['student', 'admin']);
    if (!hasPrivilege(access, 'read_admin')) relations.delete('admin');
    const query = manager
      .getRepository(User)
      .createQueryBuilder('account')
      .orderBy('account.id', 'ASC')
      .take(input.limit + 1);
    if (input.cursor)
      query.andWhere('account.id > :cursor', { cursor: input.cursor });
    if (scopes !== null) {
      query.andWhere(
        'EXISTS (SELECT 1 FROM students s WHERE s.user_id = account.id AND s.department_id IN (:...scopes))',
        { scopes },
      );
    }
    const accounts = await query.getMany();
    const page = accounts.slice(0, input.limit);
    // The directory filter and populated profiles must see the same placement and grants.
    const items: UserResponseDto[] = [];
    for (const account of page)
      items.push(await this.readView(manager, account, relations, access));
    return {
      items,
      nextCursor: accounts.length > input.limit ? page.at(-1)!.id : null,
    };
  }

  async updateProfile(
    userId: string,
    input: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string;
    },
    actorUserId?: string,
  ) {
    if (input.email !== undefined && !actorUserId)
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        'Only administrators can change the login email',
      );
    const account = await writeTransaction(this.database, async (manager) => {
      const user = await this.users.lockUser(manager, userId);
      if (actorUserId) {
        if (user.role === 'admin')
          await this.requireAdminProfileUpdate(
            manager,
            actorUserId,
            user,
            input.email !== undefined,
          );
        else
          await this.requireTarget(manager, actorUserId, user, 'update_user');
      } else if (user.status !== 'active')
        throw new ApplicationError(
          HttpStatus.UNAUTHORIZED,
          'Account is unavailable',
        );
      if (input.firstName !== undefined) user.firstName = input.firstName;
      if (input.lastName !== undefined) user.lastName = input.lastName;
      const newEmail =
        input.email === undefined ? user.email : accountEmail(input.email);
      const revoked = newEmail !== user.email;
      if (revoked) {
        user.email = newEmail;
        user.authVersion += 1;
      }
      await manager.getRepository(User).save(user);
      return { user, revoked };
    });
    if (account.revoked) this.publishAuthChange(account.user);
    this.log.log('Account profile updated', {
      userId,
      actorUserId,
      sessionsRevoked: account.revoked,
    });
    return userView(account.user);
  }

  async updatePlacement(
    actorUserId: string,
    userId: string,
    input: PlacementDto,
  ) {
    const result = await writeTransaction(this.database, async (manager) => {
      const user = await this.users.lockUser(manager, userId);
      if (user.role !== 'student')
        throw new ApplicationError(
          HttpStatus.NOT_FOUND,
          'Student account was not found',
        );
      const students = manager.getRepository<Student>('Student');
      const student = await students.findOneByOrFail({ userId });
      const access = await this.auth.require(
        actorUserId,
        'update_student_placement',
        student.departmentId,
        manager,
      );
      const next = await this.placement.resolve(manager, input, true);
      if (
        !hasPrivilege(access, 'update_student_placement', next.departmentId)
      ) {
        throw new ApplicationError(
          HttpStatus.FORBIDDEN,
          'Insufficient privileges in the destination department',
        );
      }
      Object.assign(student, next);
      await students.save(student);
      const matricNumber = await this.placement.issueMatriculation(
        manager,
        student,
      );
      return { ...userView(user), student: studentView(student, matricNumber) };
    });
    this.log.log('Student placement updated', {
      actorUserId,
      userId,
      departmentId: result.student.departmentId ?? undefined,
    });
    return result;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const hashedPassword = await hashPassword(newPassword);
    const user = await writeTransaction(this.database, async (manager) => {
      const account = await this.users.lockUser(manager, userId);
      if (
        account.status !== 'active' ||
        !account.hashedPassword ||
        !(await matchesPassword(currentPassword, account.hashedPassword))
      ) {
        throw new ApplicationError(
          HttpStatus.UNAUTHORIZED,
          'Current password could not be verified',
        );
      }
      account.hashedPassword = hashedPassword;
      account.authVersion += 1;
      return manager.getRepository(User).save(account);
    });
    this.publishAuthChange(user);
    this.log.log('Account password changed', { userId });
  }

  async manageStatus(
    actorUserId: string,
    userId: string,
    status: User['status'],
  ): Promise<UserResponseDto> {
    const result = await writeTransaction(this.database, async (manager) => {
      const user = await this.users.lockUser(manager, userId);
      await this.requireTarget(manager, actorUserId, user, 'suspend_user');
      if (user.status === status) return { user, revoked: false };
      user.status = status;
      if (status === 'suspended') user.authVersion += 1;
      await manager.getRepository(User).save(user);
      return { user, revoked: status === 'suspended' };
    });
    if (result.revoked) this.publishAuthChange(result.user);
    this.log.log('Account status set', { actorUserId, userId, status });
    return userView(result.user);
  }

  async revokeSessions(actorUserId: string, userId: string): Promise<void> {
    const user = await writeTransaction(this.database, async (manager) => {
      const account = await this.users.lockUser(manager, userId);
      await this.requireTarget(
        manager,
        actorUserId,
        account,
        'revoke_user_sessions',
      );
      account.authVersion += 1;
      return manager.getRepository(User).save(account);
    });
    this.publishAuthChange(user);
    this.log.log('Account sessions revoked', { actorUserId, userId });
  }

  async deleteAccount(userId: string, actorUserId?: string): Promise<void> {
    const user = await writeTransaction(this.database, async (manager) => {
      const account = await this.users.lockUser(manager, userId, true);
      if (actorUserId)
        await this.requireTarget(manager, actorUserId, account, 'delete_user');
      if (account.deletedAt) return account;
      if (!actorUserId && account.status !== 'active')
        throw new ApplicationError(
          HttpStatus.UNAUTHORIZED,
          'Account is unavailable',
        );

      // Capture identifiers before clearing the profile. Notes are mutable, while
      // audit entries already omit raw feedback and must remain append-only.
      const identity = {
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        matricNumber: null as string | null,
      };
      account.email =
        'deleted-' + account.id.replaceAll('-', '') + '@redacted.invalid';
      account.firstName = null;
      account.lastName = null;
      account.hashedPassword = null;
      account.authVersion += 1;
      account.deletedAt = new Date();
      await manager.getRepository(User).save(account);
      if (account.role === 'student') {
        const students = manager.getRepository<Student>('Student');
        const student = await students.findOneByOrFail({ userId });
        const matriculation =
          manager.getRepository<MatricNumSystem>('MatricNumSystem');
        identity.matricNumber =
          (await matriculation.findOneBy({ studentId: student.id }))
            ?.matricNumber ?? null;
        await matriculation.delete({ studentId: student.id });
        await students.update(student.id, {
          academicLevelId: null,
          courseOfStudyId: null,
          departmentId: null,
          facultyId: null,
        });
      }
      await redactResultNotes(manager, identity);
      return account;
    });
    this.publishAuthChange(user);
    this.log.log('Account identity redacted', { userId, actorUserId });
  }

  private async requireAdminProfileUpdate(
    manager: EntityManager,
    actorUserId: string,
    target: User,
    changesEmail: boolean,
  ): Promise<void> {
    const actor = await this.auth.resolve(actorUserId, manager);
    if (hasPrivilege(actor, 'update_user')) return;
    if (changesEmail)
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        'Only a university-wide administrator can change a staff login email.',
      );

    // A staff account has one shared profile. Every grant must fall inside the editor's
    // scope, including grants that do not provide teaching privileges.
    const lecturer = await this.auth.resolve(target.id, manager);
    if (!canManageLecturerProfile(actor, lecturer.grants))
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        'You can only edit a lecturer whose staff grants are all in departments you manage.',
      );
  }

  private async requireTarget(
    manager: EntityManager,
    actorUserId: string,
    target: User,
    privilege: Privilege,
  ): Promise<void> {
    await this.auth.require(
      actorUserId,
      privilege,
      await this.departmentOf(manager, target),
      manager,
    );
  }

  private async departmentOf(
    manager: EntityManager,
    account: User,
  ): Promise<string | null> {
    if (account.role === 'admin') return null;
    const student = await manager
      .getRepository<Student>('Student')
      .findOneBy({ userId: account.id });
    return student?.departmentId ?? null;
  }

  private async readView(
    manager: EntityManager,
    account: User,
    relations: Set<string>,
    access?: AdminAccess,
  ): Promise<UserResponseDto> {
    const view = userView(account);
    if (account.role === 'student' && relations.has('student')) {
      const student = await manager
        .getRepository<Student>('Student')
        .findOneBy({ userId: account.id });
      if (
        student &&
        (!access || hasPrivilege(access, 'read_user', student.departmentId))
      ) {
        const matric = await manager
          .getRepository<MatricNumSystem>('MatricNumSystem')
          .findOneBy({ studentId: student.id });
        view.student = studentView(student, matric?.matricNumber ?? null);
      }
    }
    if (account.role === 'admin' && relations.has('admin')) {
      const admin = await manager
        .getRepository<Admin>('Admin')
        .findOneBy({ userId: account.id });
      if (admin) view.admin = { id: admin.id };
    }
    return view;
  }

  private publishAuthChange(account: User): void {
    this.events.publish(
      new AccountAuthChangedEvent(account.id, account.authVersion),
    );
  }
}

function userView(account: User): UserResponseDto {
  const { id, role, email, firstName, lastName, status, createdAt } = account;
  return { id, role, email, firstName, lastName, status, createdAt };
}

function studentView(
  student: Student,
  matricNumber: string | null,
): NonNullable<UserResponseDto['student']> {
  const { id, academicLevelId, courseOfStudyId, departmentId, facultyId } =
    student;
  return {
    id,
    academicLevelId,
    courseOfStudyId,
    departmentId,
    facultyId,
    matricNumber,
  };
}

export function accountEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (email.endsWith('@redacted.invalid'))
    throw new ApplicationError(
      HttpStatus.BAD_REQUEST,
      'This email domain is reserved',
    );
  return email;
}
