import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import type {
  DeepPartial,
  EntityManager,
  EntityTarget,
  FindOptionsWhere,
} from 'typeorm';
import { writeTransaction } from '#core/database/database-write.js';
import { ApplicationError } from '#core/http/application-error.js';
import {
  LOG_PROVIDER,
  LogService,
} from '#core/logging/services/log.service.js';
import { AdminAuthorizationService } from '#shared/admin-authorization/admin-authorization.service.js';
import {
  authorizedDepartments,
  hasPrivilege,
} from '#shared/admin-authorization/privilege.js';
import type {
  AcademicSetupResponseDto,
  DepartmentWriteDto,
  FacultyWriteDto,
  ProgrammeWriteDto,
  SemesterWriteDto,
  SessionWriteDto,
} from '../dtos/academic-setup.dto.js';
import { AcademicSession } from '../entity/academic-sessions.entity.js';
import { CourseOfStudy } from '../entity/courses-of-study.entity.js';
import { Department } from '../entity/departments.entity.js';
import { Faculty } from '../entity/faculties.entity.js';
import { Semester } from '../entity/semesters.entity.js';

@Injectable()
export class AcademicSetupService {
  constructor(
    private readonly database: DataSource,
    private readonly authorization: AdminAuthorizationService,
    @Inject(LOG_PROVIDER) private readonly log: LogService,
  ) {
    log.setContext(AcademicSetupService.name);
  }

  async read(actorId: string): Promise<AcademicSetupResponseDto> {
    const access = await this.authorization.resolve(actorId);
    const scopes = hasPrivilege(access, 'manage_university')
      ? null
      : authorizedDepartments(access, 'manage_department');
    if (scopes?.length === 0)
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        'You do not have permission to manage academic setup.',
      );
    const departments = await this.database.getRepository(Department).find({
      where: scopes ? { id: In(scopes) } : {},
      order: { name: 'ASC', id: 'ASC' },
    });
    const [faculties, programmes, sessions, semesters] = await Promise.all([
      this.database.getRepository(Faculty).find({
        where: scopes
          ? { id: In(departments.map((department) => department.facultyId)) }
          : {},
        order: { name: 'ASC', id: 'ASC' },
      }),
      this.database.getRepository(CourseOfStudy).find({
        where: scopes ? { departmentId: In(scopes) } : {},
        order: { name: 'ASC', id: 'ASC' },
      }),
      this.database
        .getRepository(AcademicSession)
        .find({ order: { startYear: 'DESC', endYear: 'DESC' } }),
      this.database
        .getRepository(Semester)
        .find({ order: { academicSessionId: 'DESC', termNumber: 'ASC' } }),
    ]);
    return { faculties, departments, programmes, sessions, semesters };
  }

  saveFaculty(actorId: string, input: FacultyWriteDto, id?: string) {
    return this.universityWrite(actorId, 'Faculty', async (manager) => {
      const previous = id
        ? await this.lock(manager, Faculty, id, 'faculty')
        : undefined;
      return this.save(
        manager,
        Faculty,
        {
          name: input.name,
          status: input.status ?? previous?.status ?? 'active',
          currentSemesterId: previous?.currentSemesterId ?? null,
        },
        previous,
      );
    });
  }

  saveDepartment(actorId: string, input: DepartmentWriteDto, id?: string) {
    return this.universityWrite(actorId, 'Department', async (manager) => {
      const previous = id
        ? await this.lock(manager, Department, id, 'department')
        : undefined;
      if (previous && previous.facultyId !== input.facultyId)
        throw new ApplicationError(
          HttpStatus.BAD_REQUEST,
          'The department must stay with its original faculty.',
        );
      await this.reference(
        manager,
        Faculty,
        input.facultyId,
        'faculty',
        !previous || input.status === 'active',
      );
      return this.save(
        manager,
        Department,
        { ...input, status: input.status ?? previous?.status ?? 'active' },
        previous,
      );
    });
  }

  async saveProgramme(actorId: string, input: ProgrammeWriteDto, id?: string) {
    const result = await writeTransaction(this.database, async (manager) => {
      const previous = id
        ? await this.lock(manager, CourseOfStudy, id, 'programme')
        : undefined;
      await this.authorization.require(
        actorId,
        'manage_department',
        previous?.departmentId ?? input.departmentId,
        manager,
      );
      if (
        previous &&
        (previous.departmentId !== input.departmentId ||
          previous.programType !== input.programType)
      )
        throw new ApplicationError(
          HttpStatus.BAD_REQUEST,
          'The programme must keep its original department and programme type.',
        );
      await this.reference(
        manager,
        Department,
        input.departmentId,
        'department',
        !previous || input.status === 'active',
      );
      return this.save(
        manager,
        CourseOfStudy,
        { ...input, status: input.status ?? previous?.status ?? 'active' },
        previous,
      );
    });
    this.log.log('Programme saved', {
      actorUserId: actorId,
      programmeId: result.id,
      departmentId: result.departmentId,
    });
    return result;
  }

  saveSession(actorId: string, input: SessionWriteDto, id?: string) {
    return this.universityWrite(
      actorId,
      'Academic session',
      async (manager) => {
        if (input.endYear < input.startYear)
          throw new ApplicationError(
            HttpStatus.BAD_REQUEST,
            'The final year must be the same as or later than the first year.',
          );
        const previous = id
          ? await this.lock(manager, AcademicSession, id, 'academic session')
          : undefined;
        return this.save(
          manager,
          AcademicSession,
          { ...input, status: input.status ?? previous?.status ?? 'inactive' },
          previous,
        );
      },
    );
  }

  saveSemester(actorId: string, input: SemesterWriteDto, id?: string) {
    return this.universityWrite(actorId, 'Semester', async (manager) => {
      const previous = id
        ? await this.lock(manager, Semester, id, 'semester')
        : undefined;
      if (previous && previous.academicSessionId !== input.academicSessionId)
        throw new ApplicationError(
          HttpStatus.BAD_REQUEST,
          'The semester must stay in its original academic session.',
        );
      const status = input.status ?? previous?.status ?? 'inactive';
      await this.reference(
        manager,
        AcademicSession,
        input.academicSessionId,
        'academic session',
        status === 'active',
      );
      return this.save(manager, Semester, { ...input, status }, previous);
    });
  }

  setCurrentSemester(
    actorId: string,
    facultyId: string,
    semesterId: string | null,
  ) {
    return this.universityWrite(
      actorId,
      'Faculty registration semester',
      async (manager) => {
        const faculty = await this.lock(manager, Faculty, facultyId, 'faculty');
        if (semesterId) {
          if (faculty.status !== 'active')
            throw new ApplicationError(
              HttpStatus.BAD_REQUEST,
              'Activate the faculty before opening registration.',
            );
          const term = await this.reference(
            manager,
            Semester,
            semesterId,
            'semester',
            true,
          );
          await this.reference(
            manager,
            AcademicSession,
            term.academicSessionId,
            'academic session',
            true,
          );
        }
        return this.save(
          manager,
          Faculty,
          { currentSemesterId: semesterId },
          faculty,
        );
      },
    );
  }

  private async universityWrite<T extends { id: string }>(
    actorId: string,
    label: string,
    operation: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const result = await writeTransaction(this.database, async (manager) => {
      await this.authorization.require(
        actorId,
        'manage_university',
        null,
        manager,
      );
      return operation(manager);
    });
    this.log.log(label + ' saved', {
      actorUserId: actorId,
      recordId: result.id,
    });
    return result;
  }

  private async lock<T extends { id: string }>(
    manager: EntityManager,
    entity: EntityTarget<T>,
    id: string,
    label: string,
  ): Promise<T> {
    const row = await manager.getRepository(entity).findOne({
      where: { id } as FindOptionsWhere<T>,
      lock: { mode: 'pessimistic_write' },
    });
    if (!row)
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        'The selected ' + label + ' could not be found.',
      );
    return row;
  }

  private async reference<T extends { id: string; status: string }>(
    manager: EntityManager,
    entity: EntityTarget<T>,
    id: string,
    label: string,
    active: boolean,
  ): Promise<T> {
    const row = await manager.getRepository(entity).findOne({
      where: { id } as FindOptionsWhere<T>,
      lock: { mode: 'pessimistic_read' },
    });
    if (!row || (active && row.status !== 'active'))
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        'Choose an available ' + label + '.',
      );
    return row;
  }

  private save<T extends { id: string }>(
    manager: EntityManager,
    entity: EntityTarget<T>,
    input: DeepPartial<T>,
    previous?: T,
  ): Promise<T> {
    const repository = manager.getRepository(entity);
    return repository.save(
      previous ? Object.assign(previous, input) : repository.create(input),
    );
  }
}
