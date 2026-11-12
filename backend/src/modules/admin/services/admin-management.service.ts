import { writeTransaction } from '#core/database/database-write.js';
import { ApplicationError } from '#core/http/application-error.js';
import { Inject, Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import type { EntityManager } from 'typeorm';
import {
  LOG_PROVIDER,
  LogService,
} from '#core/logging/services/log.service.js';
import { AdminAuthorizationService } from '#shared/admin-authorization/admin-authorization.service.js';
import {
  authorizedDepartments,
  canManageLecturerProfile,
  hasGlobalSuperAdmin,
  hasPrivilege,
} from '#shared/admin-authorization/privilege.js';
import type {
  AdminAccess,
  Privilege,
} from '#shared/admin-authorization/privilege.js';
import { hashPassword } from '#shared/auth/password.js';
import { parsePopulation } from '#shared/http/directory.dto.js';
import type { DirectoryQueryDto } from '#shared/http/directory.dto.js';
import type { User } from '#modules/user/entity/users.entity.js';
import { Admin } from '../entity/admins.entity.js';
import { AdminRole } from '../entity/admin-roles.entity.js';
import { Role } from '../entity/roles.entity.js';
import type {
  AssignAdminRoleDto,
  CreateAdminDto,
  WriteRoleDto,
} from '../dtos/admin-write.dto.js';

@Injectable()
export class AdminManagementService {
  constructor(
    private readonly database: DataSource,
    private readonly authorization: AdminAuthorizationService,
    @Inject(LOG_PROVIDER) private readonly log: LogService,
  ) {
    log.setContext(AdminManagementService.name);
  }

  async createAdmin(actorUserId: string, input: CreateAdminDto) {
    const departmentId = input.departmentId?.toLowerCase() ?? null;
    const email = input.email.trim().toLowerCase();
    if (email.endsWith('@redacted.invalid'))
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        'This email domain is reserved',
      );
    const hashedPassword = await hashPassword(input.password);
    const profile = await writeTransaction(this.database, async (manager) => {
      const actor = await this.authorization.require(
        actorUserId,
        'create_admin',
        departmentId,
        manager,
      );
      const hodProvision =
        departmentId !== null &&
        actor.grants.some(
          (grant) =>
            grant.systemKey === 'hod' &&
            grant.departmentId === departmentId &&
            grant.privileges.includes('create_admin') &&
            grant.privileges.includes('manage_department'),
        );
      const roleId =
        input.roleId ??
        (hodProvision
          ? (
              await manager
                .getRepository(Role)
                .findOneByOrFail({ systemKey: 'lecturer' })
            ).id
          : undefined);
      if (departmentId && !roleId)
        throw new ApplicationError(
          HttpStatus.BAD_REQUEST,
          'Choose a role to create an administrator in this department.',
        );
      const users = manager.getRepository<User>('User');
      const user = await users.save(
        users.create({
          email,
          hashedPassword,
          role: 'admin',
          firstName: input.firstName ?? null,
          lastName: input.lastName ?? null,
        }),
      );
      const admins = manager.getRepository(Admin);
      const admin = await admins.save(
        admins.create({ userId: user.id, createdByAdminId: actor.adminId }),
      );
      const grant = roleId
        ? await this.writeGrant(
            manager,
            actorUserId,
            admin.id,
            {
              roleId,
              departmentId,
            },
            hodProvision ? actor : undefined,
          )
        : undefined;
      return { id: admin.id, userId: user.id, grant };
    });
    this.log.log('Administrator profile created', {
      adminId: profile.id,
      actorUserId,
      departmentId: departmentId ?? undefined,
    });
    return profile;
  }

  listAdmins(actorUserId: string, input: DirectoryQueryDto, adminId?: string) {
    return this.database.transaction('REPEATABLE READ', (manager) =>
      this.readAdminDirectory(manager, actorUserId, input, adminId),
    );
  }

  private async readAdminDirectory(
    manager: EntityManager,
    actorUserId: string,
    input: DirectoryQueryDto,
    adminId?: string,
  ) {
    const actor = await this.authorization.requireAnyScope(
      actorUserId,
      'read_admin',
      manager,
    );
    const relations = parsePopulation(input.populate, ['roles', 'user']);
    const departments = authorizedDepartments(actor, 'read_admin');
    if (departments?.length === 0) return { items: [], nextCursor: null };
    const query = manager
      .getRepository(Admin)
      .createQueryBuilder('admin')
      .innerJoin('admin.user', 'account', 'account.deletedAt IS NULL')
      .orderBy('admin.id', 'ASC')
      .take(input.limit + 1);
    if (adminId) query.andWhere('admin.id = :adminId', { adminId });
    if (input.cursor)
      query.andWhere('admin.id > :cursor', { cursor: input.cursor });
    if (departments !== null) {
      query.andWhere(
        'EXISTS (SELECT 1 FROM admin_roles g WHERE g.admin_id = admin.id AND g.department_id IN (:...departments))',
        { departments },
      );
    }
    const rows = await query.getMany();
    const page = rows.slice(0, input.limit);
    const items = [];
    // Use the same view of scoped grants for selection and for populated relations.
    for (const admin of page) {
      const grants = relations.size
        ? await manager
            .getRepository(AdminRole)
            .find({ where: { adminId: admin.id }, relations: { role: true } })
        : [];
      const visible = grants.filter((grant) =>
        hasPrivilege(actor, 'read_admin', grant.departmentId),
      );
      const canReadUser =
        hasPrivilege(actor, 'read_user') ||
        visible.some((grant) =>
          hasPrivilege(actor, 'read_user', grant.departmentId),
        );
      const user =
        relations.has('user') && canReadUser
          ? await manager.getRepository<User>('User').findOne({
              where: { id: admin.userId },
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true,
              },
            })
          : undefined;
      items.push({
        id: admin.id,
        userId: admin.userId,
        createdAt: admin.createdAt,
        ...(user
          ? {
              user,
              canUpdateProfile:
                hasPrivilege(actor, 'update_user') ||
                (user.status === 'active' &&
                  canManageLecturerProfile(
                    actor,
                    grants.map((grant) => ({
                      departmentId: grant.departmentId,
                      privileges: grant.role?.privileges ?? [],
                    })),
                  )),
            }
          : {}),
        ...(relations.has('roles')
          ? {
              roles: visible.flatMap((grant) =>
                grant.role &&
                hasPrivilege(actor, 'read_role', grant.departmentId)
                  ? [
                      {
                        id: grant.id,
                        departmentId: grant.departmentId,
                        role: grant.role,
                      },
                    ]
                  : [],
              ),
            }
          : {}),
      });
    }
    return {
      items,
      nextCursor: rows.length > input.limit ? page.at(-1)!.id : null,
    };
  }

  async getAdmin(actorUserId: string, adminId: string, populate?: string) {
    const result = await this.listAdmins(
      actorUserId,
      { limit: 1, populate },
      adminId,
    );
    if (!result.items.length)
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        'Administrator was not found',
      );
    return result.items[0];
  }

  async listRoles(actorUserId: string, input: DirectoryQueryDto) {
    await this.authorization.require(actorUserId, 'read_role');
    parsePopulation(input.populate, []);
    const query = this.database
      .getRepository(Role)
      .createQueryBuilder('role')
      .orderBy('role.id', 'ASC')
      .take(input.limit + 1);
    if (input.cursor)
      query.andWhere('role.id > :cursor', { cursor: input.cursor });
    const rows = await query.getMany();
    const items = rows.slice(0, input.limit);
    return {
      items,
      nextCursor: rows.length > input.limit ? items.at(-1)!.id : null,
    };
  }

  async saveRole(
    actorUserId: string,
    input: WriteRoleDto,
    roleId?: string,
  ): Promise<Role> {
    const role = await writeTransaction(this.database, async (manager) => {
      const actor = await this.authorization.require(
        actorUserId,
        'manage_roles',
        null,
        manager,
      );
      const roles = manager.getRepository(Role);
      const existing = roleId
        ? await roles.findOne({
            where: { id: roleId },
            lock: { mode: 'pessimistic_write' },
          })
        : null;
      if (roleId && !existing)
        throw new ApplicationError(HttpStatus.NOT_FOUND, 'Role was not found');
      if (existing?.kind === 'system')
        throw new ApplicationError(
          HttpStatus.FORBIDDEN,
          'System roles are protected',
        );
      const privileges = input.privileges ?? existing?.privileges ?? [];
      requireDelegable(
        actor,
        [...(existing?.privileges ?? []), ...privileges] as Privilege[],
        null,
      );
      return roles.save(
        roles.create({
          ...existing,
          kind: 'custom',
          systemKey: null,
          name: input.name,
          description:
            input.description === undefined
              ? (existing?.description ?? null)
              : input.description,
          privileges,
          createdByAdminId: existing
            ? existing.createdByAdminId
            : actor.adminId,
        }),
      );
    });
    this.log.log(roleId ? 'Custom role updated' : 'Custom role created', {
      actorUserId,
      roleId: role.id,
    });
    return role;
  }

  async deleteRole(actorUserId: string, roleId: string): Promise<void> {
    await writeTransaction(this.database, async (manager) => {
      const actor = await this.authorization.require(
        actorUserId,
        'manage_roles',
        null,
        manager,
      );
      const roles = manager.getRepository(Role);
      const role = await roles.findOne({
        where: { id: roleId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!role)
        throw new ApplicationError(HttpStatus.NOT_FOUND, 'Role was not found');
      if (role.kind === 'system')
        throw new ApplicationError(
          HttpStatus.FORBIDDEN,
          'System roles are protected',
        );
      requireDelegable(actor, role.privileges as Privilege[], null);
      await roles.delete(role.id);
    });
    this.log.log('Custom role deleted', { actorUserId, roleId });
  }

  async assignRole(
    actorUserId: string,
    adminId: string,
    input: AssignAdminRoleDto,
  ) {
    const grant = await writeTransaction(this.database, async (manager) => {
      const target = await manager
        .getRepository(Admin)
        .createQueryBuilder('admin')
        .innerJoin('admin.user', 'account', 'account.deletedAt IS NULL')
        .where('admin.id = :adminId', { adminId })
        .setLock('pessimistic_write', undefined, ['admin', 'account'])
        .getOne();
      if (!target)
        throw new ApplicationError(
          HttpStatus.NOT_FOUND,
          'Administrator was not found',
        );
      return this.writeGrant(manager, actorUserId, adminId, input);
    });
    this.log.log('Administrator role assigned', {
      actorUserId,
      adminId,
      grantId: grant.id,
      departmentId: grant.departmentId ?? undefined,
    });
    return grant;
  }

  async revokeRole(
    actorUserId: string,
    adminId: string,
    grantId: string,
  ): Promise<void> {
    await writeTransaction(this.database, async (manager) => {
      const grants = manager.getRepository(AdminRole);
      const grant = await grants
        .createQueryBuilder('assignment')
        .innerJoinAndSelect('assignment.role', 'role')
        .where('assignment.id = :grantId AND assignment.adminId = :adminId', {
          grantId,
          adminId,
        })
        .setLock('pessimistic_write', undefined, ['assignment', 'role'])
        .getOne();
      if (!grant || !grant.role)
        throw new ApplicationError(
          HttpStatus.NOT_FOUND,
          'Role assignment was not found',
        );
      const actor = await this.authorization.require(
        actorUserId,
        'manage_admin_roles',
        grant.departmentId,
        manager,
      );
      requireDelegable(
        actor,
        grant.role.privileges as Privilege[],
        grant.departmentId,
      );
      if (
        grant.role.systemKey === 'super_admin' &&
        !hasGlobalSuperAdmin(actor)
      ) {
        throw new ApplicationError(
          HttpStatus.FORBIDDEN,
          'Only a university-wide Super Admin can revoke this assignment',
        );
      }
      await grants.delete({ id: grantId, adminId });
    });
    this.log.log('Administrator role revoked', {
      actorUserId,
      adminId,
      grantId,
    });
  }

  private async writeGrant(
    manager: EntityManager,
    actorUserId: string,
    adminId: string,
    input: AssignAdminRoleDto,
    initialHod?: AdminAccess,
  ) {
    const departmentId = input.departmentId ?? null;
    const role = await manager.getRepository(Role).findOne({
      where: { id: input.roleId },
      lock: { mode: 'pessimistic_read' },
    });
    // Only account creation can use the HOD exception for this one seeded role.
    const lecturerProvision =
      role?.systemKey === 'lecturer' ? initialHod : undefined;
    const actor =
      lecturerProvision ??
      (await this.authorization.require(
        actorUserId,
        'manage_admin_roles',
        departmentId,
        manager,
      ));
    if (!role)
      throw new ApplicationError(HttpStatus.NOT_FOUND, 'Role was not found');
    if (!lecturerProvision)
      requireDelegable(actor, role.privileges as Privilege[], departmentId);
    if (
      role.systemKey === 'super_admin' &&
      (departmentId !== null || !hasGlobalSuperAdmin(actor))
    ) {
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        'Super Admin assignments require university-wide authority',
      );
    }
    if (departmentId) {
      const [department] = await manager.query(
        'SELECT id FROM departments WHERE id = $1 AND status = $2 FOR SHARE',
        [departmentId, 'active'],
      );
      if (!department)
        throw new ApplicationError(
          HttpStatus.BAD_REQUEST,
          'Department is unavailable',
        );
    }
    const grants = manager.getRepository(AdminRole);
    const grant = await grants.save(
      grants.create({
        adminId,
        roleId: role.id,
        departmentId,
        assignedByAdminId: actor.adminId,
      }),
    );
    return {
      id: grant.id,
      adminId,
      roleId: role.id,
      departmentId,
      name: role.name,
    };
  }
}

function requireDelegable(
  actor: AdminAccess,
  privileges: Privilege[],
  departmentId: string | null,
): void {
  if (
    privileges.some(
      (privilege) => !hasPrivilege(actor, privilege, departmentId),
    )
  ) {
    throw new ApplicationError(
      HttpStatus.FORBIDDEN,
      'An administrator can only delegate privileges within their own scope',
    );
  }
}
