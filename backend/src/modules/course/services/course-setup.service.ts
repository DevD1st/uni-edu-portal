import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { writeTransaction } from '#core/database/database-write.js';
import { ApplicationError } from '#core/http/application-error.js';
import {
  LOG_PROVIDER,
  LogService,
} from '#core/logging/services/log.service.js';
import { AdminAuthorizationService } from '#shared/admin-authorization/admin-authorization.service.js';
import { RecordTransactionalAdminAuditCommand } from '#shared/admin-authorization/audit.contracts.js';
import {
  authorizedDepartments,
  hasPrivilege,
} from '#shared/admin-authorization/privilege.js';
import type { ResultGroup } from '#modules/results/entity/result-groups.entity.js';
import type { CourseOfStudy } from '#modules/academic-reference/entity/courses-of-study.entity.js';
import type {
  CourseSetupResponseDto,
  CourseWriteDto,
  CurriculumResponseDto,
  CurriculumWriteDto,
  LecturerChoicesResponseDto,
  OfferingUpdateDto,
  OfferingWriteDto,
} from '../dtos/course-setup.dto.js';
import { Course } from '../entity/courses.entity.js';
import { CourseOfStudyCourse } from '../entity/course-of-study-courses.entity.js';
import { CourseOffering } from '../entity/course-offerings.entity.js';

@Injectable()
export class CourseSetupService {
  constructor(
    private readonly database: DataSource,
    private readonly authorization: AdminAuthorizationService,
    private readonly commands: CommandBus,
    @Inject(LOG_PROVIDER) private readonly log: LogService,
  ) {
    log.setContext(CourseSetupService.name);
  }

  async read(actorId: string): Promise<CourseSetupResponseDto> {
    const access = await this.authorization.resolve(actorId);
    const scope = hasPrivilege(access, 'manage_university')
      ? null
      : authorizedDepartments(access, 'manage_department');
    if (scope?.length === 0)
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        'You do not have permission to manage courses.',
      );
    const offerings = this.database
      .getRepository(CourseOffering)
      .createQueryBuilder('offering');
    if (scope)
      offerings.where('offering.departmentId IN (:...scope)', { scope });
    const [courses, curriculum, deliveries] = await Promise.all([
      this.database.getRepository(Course).find({ order: { code: 'ASC' } }),
      this.database.query<CurriculumResponseDto[]>(
        `
        SELECT l.id, l.course_of_study_id AS "courseOfStudyId", l.course_id AS "courseId"
        FROM course_of_study_courses l JOIN courses_of_study p ON p.id = l.course_of_study_id
        WHERE ($1::uuid[] IS NULL OR p.department_id = ANY($1::uuid[]))
        ORDER BY l.course_of_study_id, l.course_id
      `,
        [scope],
      ),
      offerings.orderBy('offering.id', 'ASC').getMany(),
    ]);
    return { courses, curriculum, offerings: deliveries };
  }

  async lecturers(
    actorId: string,
    departmentId: string,
  ): Promise<LecturerChoicesResponseDto> {
    await this.authorization.require(
      actorId,
      'manage_department',
      departmentId,
    );
    const lecturers = await this.database.query<
      LecturerChoicesResponseDto['lecturers']
    >(
      `
      SELECT a.id, u.first_name AS "firstName", u.last_name AS "lastName"
      FROM admins a JOIN users u ON u.id = a.user_id
      WHERE u.status = 'active' AND u.deleted_at IS NULL AND EXISTS (
        SELECT 1 FROM admin_roles g JOIN roles r ON r.id = g.role_id
        WHERE g.admin_id = a.id AND (g.department_id = $1 OR g.department_id IS NULL)
          AND 'teach_course' = ANY(r.privileges)
      )
      ORDER BY u.last_name, u.first_name, a.id
    `,
      [departmentId],
    );
    return { lecturers };
  }

  async saveCourse(actorId: string, input: CourseWriteDto, id?: string) {
    const course = await writeTransaction(this.database, async (manager) => {
      await this.authorization.require(
        actorId,
        'manage_university',
        null,
        manager,
      );
      const repository = manager.getRepository(Course);
      const previous = id
        ? await repository.findOne({
            where: { id },
            lock: { mode: 'pessimistic_write' },
          })
        : null;
      if (id && !previous)
        throw new ApplicationError(
          HttpStatus.NOT_FOUND,
          'The course could not be found.',
        );
      return repository.save(
        Object.assign(previous ?? repository.create(), input, {
          status: input.status ?? previous?.status ?? 'active',
        }),
      );
    });
    this.log.log('Catalog course saved', {
      actorUserId: actorId,
      courseId: course.id,
    });
    return course;
  }

  async addCurriculum(actorId: string, input: CurriculumWriteDto) {
    const link = await writeTransaction(this.database, async (manager) => {
      await this.requireProgramme(
        manager,
        actorId,
        input.courseOfStudyId,
        true,
      );
      await this.activeCourse(manager, input.courseId);
      const repository = manager.getRepository(CourseOfStudyCourse);
      return repository.save(repository.create(input));
    });
    this.log.log('Course added to programme', {
      actorUserId: actorId,
      curriculumId: link.id,
    });
    return link;
  }

  async removeCurriculum(actorId: string, id: string): Promise<void> {
    await writeTransaction(this.database, async (manager) => {
      const repository = manager.getRepository(CourseOfStudyCourse);
      const link = await repository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!link)
        throw new ApplicationError(
          HttpStatus.NOT_FOUND,
          'The programme course link could not be found.',
        );
      await this.requireProgramme(
        manager,
        actorId,
        link.courseOfStudyId,
        false,
      );
      await repository.delete(id);
    });
    this.log.log('Course removed from programme', {
      actorUserId: actorId,
      curriculumId: id,
    });
  }

  async createOffering(actorId: string, input: OfferingWriteDto) {
    const offering = await writeTransaction(this.database, async (manager) => {
      await this.authorization.require(
        actorId,
        'manage_department',
        input.departmentId,
        manager,
      );
      const course = await this.activeCourse(manager, input.courseId);
      const status = input.status ?? 'inactive';
      await this.validateOffering(manager, input, status === 'active');
      const [policy] = await manager.query<{ id: string }[]>(`
        SELECT id FROM grading_policies WHERE status = 'active' FOR SHARE
      `);
      if (!policy)
        throw new ApplicationError(
          HttpStatus.CONFLICT,
          'Activate a grading policy before creating an offering.',
        );
      const repository = manager.getRepository(CourseOffering);
      return repository.save(
        repository.create({
          ...input,
          status,
          units: course.units,
          lecturerId: input.lecturerId ?? null,
          gradingPolicyId: policy.id,
        }),
      );
    });
    this.log.log('Course offering created', {
      actorUserId: actorId,
      offeringId: offering.id,
      departmentId: offering.departmentId,
    });
    return offering;
  }

  async updateOffering(actorId: string, id: string, input: OfferingUpdateDto) {
    const result = await writeTransaction(this.database, async (manager) => {
      const repository = manager.getRepository(CourseOffering);
      const offering = await repository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!offering)
        throw new ApplicationError(
          HttpStatus.NOT_FOUND,
          'The course offering could not be found.',
        );
      const actor = await this.authorization.require(
        actorId,
        'manage_department',
        offering.departmentId,
        manager,
      );
      const before = {
        lecturerId: offering.lecturerId,
        status: offering.status,
      };
      const status = input.status ?? offering.status;
      const lecturerId =
        input.lecturerId === undefined ? offering.lecturerId : input.lecturerId;
      const changedLecturer = lecturerId !== offering.lecturerId;
      if (status === 'active' || (changedLecturer && lecturerId)) {
        await this.activeCourse(manager, offering.courseId);
        await this.validateOffering(
          manager,
          { ...offering, lecturerId },
          status === 'active',
        );
      }
      let resultGroupId: string | undefined;
      if (changedLecturer) {
        // Keep the roster and offering on the same lecturer under the offering lock.
        const groups = manager.getRepository<ResultGroup>('ResultGroup');
        const group = await groups.findOne({
          where: { courseOfferingId: id },
          lock: { mode: 'pessimistic_write' },
        });
        if (group) {
          if (
            !lecturerId ||
            !['pending', 'correction_requested'].includes(group.status)
          )
            throw new ApplicationError(
              HttpStatus.CONFLICT,
              'Assign a lecturer only while the results are editable. An existing roster must keep a lecturer.',
            );
          group.lecturerId = lecturerId;
          await groups.save(group);
          resultGroupId = group.id;
        }
      }
      offering.lecturerId = lecturerId;
      offering.status = status;
      const updated = await repository.save(offering);
      await this.commands.execute(
        new RecordTransactionalAdminAuditCommand(
          manager,
          actorId,
          actor.adminId,
          [
            {
              action: 'academic.offering.update',
              targetId: offering.id,
              changes: { before, after: { lecturerId, status } },
              metadata: {
                departmentId: offering.departmentId,
                offeringId: offering.id,
                resultGroupId,
              },
            },
          ],
        ),
      );
      return updated;
    });
    this.log.log('Course offering updated', {
      actorUserId: actorId,
      offeringId: id,
      departmentId: result.departmentId,
      lecturerId: result.lecturerId,
      status: result.status,
    });
    return result;
  }

  private async requireProgramme(
    manager: EntityManager,
    actorId: string,
    id: string,
    active: boolean,
  ) {
    const programme = await manager
      .getRepository<CourseOfStudy>('CourseOfStudy')
      .findOne({
        where: { id },
        lock: { mode: 'pessimistic_read' },
      });
    if (!programme)
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        'The programme could not be found.',
      );
    await this.authorization.require(
      actorId,
      'manage_department',
      programme.departmentId,
      manager,
    );
    if (active && programme.status !== 'active')
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        'Choose an active programme.',
      );
    return programme;
  }

  private async activeCourse(manager: EntityManager, courseId: string) {
    const course = await manager.getRepository(Course).findOne({
      where: { id: courseId, status: 'active' },
      lock: { mode: 'pessimistic_read' },
    });
    if (!course)
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        'Choose an active catalog course.',
      );
    return course;
  }

  private async validateOffering(
    manager: EntityManager,
    input: OfferingWriteDto,
    activate: boolean,
  ) {
    const [placement] = await manager.query<
      { programType: string; termActive: boolean }[]
    >(
      `
      SELECT l.program_type AS "programType", (s.status = 'active' AND a.status = 'active') AS "termActive"
      FROM departments d JOIN faculties f ON f.id = d.faculty_id
      JOIN semesters s ON s.id = $2 JOIN academic_sessions a ON a.id = s.academic_session_id
      JOIN academic_levels l ON l.id = $3
      WHERE d.id = $1 AND d.status = 'active' AND f.status = 'active'
        AND l.status = 'active' AND l.stage > 0
      FOR SHARE OF d, f, s, a, l
    `,
      [input.departmentId, input.semesterId, input.academicLevelId],
    );
    if (!placement)
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        'Choose an active department and study level, and an existing semester.',
      );
    if (activate && !placement.termActive)
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        'Activate the semester and its academic session first.',
      );
    if (activate && !input.lecturerId)
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        'Assign a lecturer before activating the offering.',
      );
    if (input.lecturerId) {
      const [grant] = await manager.query<{ id: string }[]>(
        `
        SELECT a.id FROM admins a JOIN users u ON u.id = a.user_id
        JOIN admin_roles g ON g.admin_id = a.id JOIN roles r ON r.id = g.role_id
        WHERE a.id = $1 AND u.status = 'active' AND u.deleted_at IS NULL
          AND (g.department_id = $2 OR g.department_id IS NULL)
          AND 'teach_course' = ANY(r.privileges)
        ORDER BY g.id LIMIT 1 FOR SHARE OF a, u, g, r
      `,
        [input.lecturerId, input.departmentId],
      );
      if (!grant)
        throw new ApplicationError(
          HttpStatus.BAD_REQUEST,
          'Choose an active lecturer with teaching permission in this department.',
        );
    }
    if (activate) {
      const [link] = await manager.query<{ id: string }[]>(
        `
        SELECT l.id FROM course_of_study_courses l JOIN courses_of_study p ON p.id = l.course_of_study_id
        WHERE l.course_id = $1 AND p.department_id = $2 AND p.program_type = $3 AND p.status = 'active'
        ORDER BY l.id LIMIT 1 FOR SHARE OF l, p
      `,
        [input.courseId, input.departmentId, placement.programType],
      );
      if (!link)
        throw new ApplicationError(
          HttpStatus.BAD_REQUEST,
          'Add the course to an active programme for this department and study level first.',
        );
    }
  }
}
