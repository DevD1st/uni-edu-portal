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
import type { AccountPrincipal } from '#shared/auth/account-context.js';
import type { ResultGroup } from '#modules/results/entity/result-groups.entity.js';
import type {
  AvailableCourseDto,
  AvailableCoursesResponseDto,
  RegisteredCourseDto,
  RegisteredTermDto,
  RegisteredTermsResponseDto,
  RegistrationReportQueryDto,
  RegistrationRosterResponseDto,
  RegistrationSummaryResponseDto,
  RegistrationWriteDto,
  RosterClosureResponseDto,
  RosterQueryDto,
  RosterStudentResponseDto,
  TeachingOfferingDto,
  TeachingOfferingsResponseDto,
} from '../dtos/registration.dto.js';
import { StudentRegisterSemester } from '../entity/student-register-semesters.entity.js';
import { StudentRegisteredCourse } from '../entity/student-registered-courses.entity.js';

interface Placement {
  facultyId: string | null;
  departmentId: string | null;
  courseOfStudyId: string | null;
  academicLevelId: string | null;
}

interface RegistrationContext extends RequiredPlacement {
  studentId: string;
  semesterId: string;
  termId?: string;
  maxUnits: number;
}

type RequiredPlacement = { [Key in keyof Placement]: string };

const termProjection = `
  SELECT t.id, t.semester_id AS "semesterId", s.name AS "semesterName",
    a.start_year || '/' || a.end_year AS "academicSession", f.name AS faculty,
    d.name AS department, p.name AS programme, l.display_name AS "academicLevel",
    u.first_name AS "firstName", u.last_name AS "lastName", m.matric_number AS "matricNumber",
    COALESCE((SELECT sum(e.registered_units) FROM student_registered_courses e
      WHERE e.student_register_semester_id = t.id), 0)::int AS "totalUnits"
  FROM student_register_semesters t JOIN students student ON student.id = t.student_id
  JOIN users u ON u.id = student.user_id LEFT JOIN matric_num_systems m ON m.student_id = student.id
  JOIN semesters s ON s.id = t.semester_id JOIN academic_sessions a ON a.id = s.academic_session_id
  JOIN faculties f ON f.id = t.faculty_id JOIN departments d ON d.id = t.department_id
  JOIN courses_of_study p ON p.id = t.course_of_study_id JOIN academic_levels l ON l.id = t.academic_level_id
`;

const enrollmentProjection = `
  SELECT e.id, e.course_id AS "courseId", g.course_offering_id AS "offeringId",
    c.code, c.name, e.registered_units AS units, e.result_group_id AS "resultGroupId"
`;

@Injectable()
export class RegistrationService {
  constructor(
    private readonly database: DataSource,
    private readonly authorization: AdminAuthorizationService,
    private readonly commands: CommandBus,
    @Inject(LOG_PROVIDER) private readonly log: LogService,
  ) {
    log.setContext(RegistrationService.name);
  }

  available(
    actor: AccountPrincipal,
    semesterId?: string,
    studentUserId?: string,
  ): Promise<AvailableCoursesResponseDto> {
    if (!studentUserId) requireStudent(actor);
    // A concurrent enrollment or semester change must not split the units and available courses.
    return this.database.transaction('REPEATABLE READ', async (manager) => {
      const context = await this.context(
        manager,
        studentUserId ?? actor.userId,
        semesterId,
        studentUserId ? { actorId: actor.userId } : undefined,
      );
      const existing = await this.enrollments(manager, context.termId);
      return {
        semesterId: context.semesterId,
        maxUnits: context.maxUnits,
        registeredUnits: existing.reduce((total, row) => total + row.units, 0),
        courses: await this.eligible(manager, context),
      };
    });
  }

  async register(
    actor: AccountPrincipal,
    input: RegistrationWriteDto,
    studentUserId?: string,
  ): Promise<RegistrationSummaryResponseDto> {
    if (!studentUserId) requireStudent(actor);
    const target = studentUserId ?? actor.userId;
    const summary = await writeTransaction(this.database, async (manager) => {
      const context = await this.context(manager, target, input.semesterId, {
        lock: true,
        actorId: studentUserId ? actor.userId : undefined,
      });
      // The account lock serializes first registration, placement changes and later unit checks.
      const terms = manager.getRepository(StudentRegisterSemester);
      const term = context.termId
        ? await terms.findOneOrFail({
            where: { id: context.termId },
            lock: { mode: 'pessimistic_write' },
          })
        : await terms.save(
            terms.create({
              studentId: context.studentId,
              semesterId: context.semesterId,
              facultyId: context.facultyId,
              departmentId: context.departmentId,
              courseOfStudyId: context.courseOfStudyId,
              academicLevelId: context.academicLevelId,
            }),
          );

      // Match the lock order used by roster closure and the database enrollment trigger.
      await manager.query(
        `
        SELECT id FROM course_offerings WHERE id = ANY($1::uuid[]) ORDER BY id FOR UPDATE
      `,
        [input.offeringIds],
      );
      const selected = await this.eligible(manager, context, input.offeringIds);
      if (selected.length !== input.offeringIds.length)
        throw new ApplicationError(
          HttpStatus.BAD_REQUEST,
          'One or more selected offerings are unavailable for this programme, level, or semester.',
        );
      const existing = await this.enrollments(manager, term.id);
      const courseIds = new Set(existing.map((row) => row.courseId));
      let units = existing.reduce((total, row) => total + row.units, 0);
      for (const offering of selected) {
        if (courseIds.has(offering.courseId))
          throw new ApplicationError(
            HttpStatus.CONFLICT,
            'A selected course is already registered in this semester.',
          );
        courseIds.add(offering.courseId);
        units += offering.units;
      }
      if (units > context.maxUnits)
        throw new ApplicationError(
          HttpStatus.BAD_REQUEST,
          'This selection exceeds the semester limit of ' +
            context.maxUnits +
            ' credit units.',
        );

      const groups = manager.getRepository<ResultGroup>('ResultGroup');
      const saved = await groups
        .createQueryBuilder('group')
        .where('group.courseOfferingId IN (:...offeringIds)', {
          offeringIds: input.offeringIds,
        })
        .orderBy('group.courseOfferingId', 'ASC')
        .setLock('pessimistic_write')
        .getMany();
      if (saved.some((group) => group.registrationStatus === 'closed'))
        throw new ApplicationError(
          HttpStatus.CONFLICT,
          'Registration has closed for one or more selected courses.',
        );
      const byOffering = new Map(
        saved.map((group) => [group.courseOfferingId, group]),
      );
      const enrollments = manager.getRepository(StudentRegisteredCourse);
      for (const offering of selected) {
        const group =
          byOffering.get(offering.offeringId) ??
          (await groups.save(
            groups.create({
              courseOfferingId: offering.offeringId,
              lecturerId: offering.lecturerId,
            }),
          ));
        await enrollments.save(
          enrollments.create({
            studentId: context.studentId,
            courseId: offering.courseId,
            studentRegisterSemesterId: term.id,
            resultGroupId: group.id,
            registeredUnits: offering.units,
            registeredByUserId: actor.userId,
          }),
        );
      }
      return this.termSummary(manager, target, context.semesterId);
    });
    this.log.log('Student courses registered', {
      actorUserId: actor.userId,
      studentUserId: target,
      semesterId: summary.semesterId,
      registrationId: summary.id,
      courseCount: input.offeringIds.length,
    });
    return summary;
  }

  async terms(actor: AccountPrincipal): Promise<RegisteredTermsResponseDto> {
    requireStudent(actor);
    const terms = await this.database.query<RegisteredTermDto[]>(
      termProjection +
        `
      WHERE student.user_id = $1 ORDER BY a.start_year DESC, a.end_year DESC, s.term_number DESC, t.id
    `,
      [actor.userId],
    );
    return { terms };
  }

  summary(
    actor: AccountPrincipal,
    semesterId: string,
  ): Promise<RegistrationSummaryResponseDto> {
    requireStudent(actor);
    return this.database.transaction('REPEATABLE READ', (manager) =>
      this.termSummary(manager, actor.userId, semesterId),
    );
  }

  report(
    actorId: string,
    input: RegistrationReportQueryDto,
  ): Promise<RegistrationRosterResponseDto> {
    return this.database.transaction('REPEATABLE READ', async (manager) => {
      const access = await this.authorization.require(
        actorId,
        'read_registration',
        input.departmentId,
        manager,
      );
      if (
        !hasPrivilege(access, 'manage_department', input.departmentId) &&
        !hasPrivilege(access, 'manage_university')
      )
        throw new ApplicationError(
          HttpStatus.FORBIDDEN,
          'You do not have permission to view registrations for this whole department.',
        );
      return this.rosterPage(manager, input, {
        departmentId: input.departmentId,
        semesterId: input.semesterId,
      });
    });
  }

  teachingOfferings(actorId: string): Promise<TeachingOfferingsResponseDto> {
    return this.database.transaction('REPEATABLE READ', async (manager) => {
      const access = await this.authorization.requireAnyScope(
        actorId,
        'teach_course',
        manager,
      );
      const scope = authorizedDepartments(access, 'teach_course');
      const offerings = await manager.query<TeachingOfferingDto[]>(
        `
      SELECT o.id AS "offeringId", o.course_id AS "courseId", o.semester_id AS "semesterId",
        o.department_id AS "departmentId", c.code, c.name, o.units,
        COALESCE(g.registration_status, 'opened') AS "registrationStatus"
      FROM course_offerings o JOIN courses c ON c.id = o.course_id
      LEFT JOIN result_groups g ON g.course_offering_id = o.id
      WHERE o.lecturer_id = $1 AND ($2::uuid[] IS NULL OR o.department_id = ANY($2::uuid[]))
      ORDER BY o.semester_id DESC, c.code, o.id
        `,
        [access.adminId, scope],
      );
      return { offerings };
    });
  }

  lecturerRoster(
    actorId: string,
    id: string,
    input: RosterQueryDto,
  ): Promise<RegistrationRosterResponseDto> {
    // An assignment change and a privilege change must not be read from different snapshots.
    return this.database.transaction('REPEATABLE READ', async (manager) => {
      const assignment = await this.requireTeaching(manager, actorId, id);
      return this.rosterPage(manager, input, {
        offeringId: id,
        lecturerId: assignment.adminId,
      });
    });
  }

  async closeRoster(
    actorId: string,
    offeringId: string,
  ): Promise<RosterClosureResponseDto> {
    const result = await writeTransaction(this.database, async (manager) => {
      const { adminId, departmentId } = await this.requireTeaching(
        manager,
        actorId,
        offeringId,
        true,
      );
      const repository = manager.getRepository<ResultGroup>('ResultGroup');
      const group = await repository.findOne({
        where: { courseOfferingId: offeringId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!group)
        throw new ApplicationError(
          HttpStatus.CONFLICT,
          'The roster will be available after the first student registers.',
        );
      if (!group.registrationClosedAt) {
        group.registrationStatus = 'closed';
        group.registrationClosedAt = new Date();
        group.registrationClosedByAdminId = adminId;
        await repository.save(group);
        await this.commands.execute(
          new RecordTransactionalAdminAuditCommand(manager, actorId, adminId, [
            {
              action: 'registration.close_roster',
              targetId: group.id,
              changes: { before: 'opened', after: 'closed' },
              metadata: { departmentId, offeringId, resultGroupId: group.id },
            },
          ]),
        );
      }
      return { id: group.id, offeringId, closedAt: group.registrationClosedAt };
    });
    this.log.log('Course roster closed', {
      actorUserId: actorId,
      offeringId,
      resultGroupId: result.id,
    });
    return result;
  }

  private async context(
    manager: EntityManager,
    userId: string,
    requestedSemesterId?: string,
    options?: { actorId?: string; lock?: boolean },
  ): Promise<RegistrationContext> {
    if (options?.lock) {
      // Lock before reading placement so a concurrent placement update cannot leave us with a stale snapshot.
      await manager.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [
        userId,
      ]);
    }
    const [student] = await manager.query<
      (Placement & {
        id: string;
        matricNumber: string | null;
        currentSemesterId: string | null;
      })[]
    >(
      `
      SELECT s.id, s.faculty_id AS "facultyId", s.department_id AS "departmentId",
        s.course_of_study_id AS "courseOfStudyId", s.academic_level_id AS "academicLevelId",
        m.matric_number AS "matricNumber", f.current_semester_id AS "currentSemesterId"
      FROM users u JOIN students s ON s.user_id = u.id
      LEFT JOIN matric_num_systems m ON m.student_id = s.id LEFT JOIN faculties f ON f.id = s.faculty_id
      WHERE u.id = $1 AND u.role = 'student' AND u.status = 'active' AND u.deleted_at IS NULL
    `,
      [userId],
    );
    if (!student)
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        'An active student account could not be found.',
      );
    const semesterId = requestedSemesterId ?? student.currentSemesterId;
    const term = semesterId
      ? await manager
          .getRepository(StudentRegisterSemester)
          .findOneBy({ studentId: student.id, semesterId })
      : null;
    const placement = term ?? student;
    if (options?.actorId) {
      const access = await this.authorization.require(
        options.actorId,
        'register_student_courses',
        student.departmentId,
        manager,
      );
      // After a transfer, a delegated write affects both the student and the original department's roster.
      if (
        !hasPrivilege(
          access,
          'register_student_courses',
          placement.departmentId,
        )
      )
        throw new ApplicationError(
          HttpStatus.FORBIDDEN,
          'You do not have permission to register courses for the department on this semester record.',
        );
    }
    if (!student.matricNumber || !complete(placement))
      throw new ApplicationError(
        HttpStatus.CONFLICT,
        'A student needs a complete academic placement and a matriculation number before registering.',
      );
    if (!semesterId)
      throw new ApplicationError(
        HttpStatus.CONFLICT,
        'Your faculty has not opened a semester for registration.',
      );
    const [semester] = await manager.query<{ id: string; maxUnits: number }[]>(
      `
      SELECT s.id, s.max_units AS "maxUnits"
      FROM faculties f JOIN departments d ON d.faculty_id = f.id
      JOIN courses_of_study p ON p.department_id = d.id
      JOIN academic_levels l ON l.program_type = p.program_type
      JOIN semesters s ON s.id = f.current_semester_id JOIN academic_sessions a ON a.id = s.academic_session_id
      WHERE f.id = $1 AND d.id = $2 AND p.id = $3 AND l.id = $4 AND s.id = $5
        AND f.status = 'active' AND d.status = 'active' AND p.status = 'active'
        AND l.status = 'active' AND l.stage > 0 AND s.status = 'active' AND a.status = 'active'
      ${options?.lock ? 'FOR SHARE OF f, d, p, l, s, a' : ''}
    `,
      [
        placement.facultyId,
        placement.departmentId,
        placement.courseOfStudyId,
        placement.academicLevelId,
        semesterId,
      ],
    );
    if (!semester)
      throw new ApplicationError(
        HttpStatus.CONFLICT,
        'Registration requires an active placement and the current active semester for its faculty.',
      );
    return {
      studentId: student.id,
      semesterId: semester.id,
      termId: term?.id,
      maxUnits: semester.maxUnits,
      facultyId: placement.facultyId,
      departmentId: placement.departmentId,
      courseOfStudyId: placement.courseOfStudyId,
      academicLevelId: placement.academicLevelId,
    };
  }

  private eligible(
    manager: EntityManager,
    context: RegistrationContext,
    ids?: string[],
  ) {
    // Keep the instructor's account and teaching grant valid through enrollment.
    return manager.query<(AvailableCourseDto & { lecturerId: string })[]>(
      `
      SELECT o.id AS "offeringId", c.id AS "courseId", c.code, c.name, o.units, o.lecturer_id AS "lecturerId"
      FROM course_offerings o JOIN courses c ON c.id = o.course_id
      JOIN course_of_study_courses link ON link.course_id = c.id AND link.course_of_study_id = $4
      JOIN LATERAL (
        SELECT 1
        FROM admins a JOIN users u ON u.id = a.user_id
        JOIN admin_roles g ON g.admin_id = a.id JOIN roles r ON r.id = g.role_id
        WHERE a.id = o.lecturer_id AND u.role = 'admin' AND u.status = 'active' AND u.deleted_at IS NULL
          AND (g.department_id = o.department_id OR g.department_id IS NULL)
          AND 'teach_course' = ANY(r.privileges)
        ORDER BY g.id LIMIT 1 ${ids ? 'FOR SHARE OF a, u, g, r' : ''}
      ) teaching ON true
      WHERE o.department_id = $1 AND o.semester_id = $2 AND o.academic_level_id = $3
        AND o.status = 'active' AND c.status = 'active'
        ${
          ids
            ? 'AND o.id = ANY($5::uuid[])'
            : `AND NOT EXISTS (
          SELECT 1 FROM result_groups g WHERE g.course_offering_id = o.id AND g.registration_status = 'closed'
        ) AND NOT EXISTS (
          SELECT 1 FROM student_registered_courses e WHERE e.student_register_semester_id = $5 AND e.course_id = c.id
        )`
        }
      ORDER BY o.id ${ids ? 'FOR SHARE OF c, link' : ''}
    `,
      [
        context.departmentId,
        context.semesterId,
        context.academicLevelId,
        context.courseOfStudyId,
        ids ?? context.termId ?? null,
      ],
    );
  }

  private enrollments(
    manager: EntityManager,
    termId?: string,
  ): Promise<RegisteredCourseDto[]> {
    if (!termId) return Promise.resolve([]);
    return manager.query<RegisteredCourseDto[]>(
      enrollmentProjection +
        `
      FROM student_registered_courses e JOIN courses c ON c.id = e.course_id
      JOIN result_groups g ON g.id = e.result_group_id
      WHERE e.student_register_semester_id = $1 ORDER BY c.code, e.id
    `,
      [termId],
    );
  }

  private async termSummary(
    manager: EntityManager,
    userId: string,
    semesterId: string,
  ): Promise<RegistrationSummaryResponseDto> {
    const [term] = await manager.query<
      Omit<RegistrationSummaryResponseDto, 'courses'>[]
    >(
      termProjection +
        `
      WHERE student.user_id = $1 AND t.semester_id = $2
    `,
      [userId, semesterId],
    );
    if (!term)
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        'No course registration was found for this semester.',
      );
    return { ...term, courses: await this.enrollments(manager, term.id) };
  }

  private async requireTeaching(
    manager: EntityManager,
    actorId: string,
    id: string,
    lock = false,
  ) {
    const [offering] = await manager.query<
      { departmentId: string; lecturerId: string | null }[]
    >(
      `
      SELECT department_id AS "departmentId", lecturer_id AS "lecturerId"
      FROM course_offerings WHERE id = $1 ${lock ? 'FOR UPDATE' : ''}
    `,
      [id],
    );
    if (!offering)
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        'The course offering could not be found.',
      );
    const access = await this.authorization.require(
      actorId,
      'teach_course',
      offering.departmentId,
      manager,
    );
    if (offering.lecturerId !== access.adminId)
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        'Only the lecturer assigned to this offering can access its roster.',
      );
    return { adminId: access.adminId, departmentId: offering.departmentId };
  }

  private async rosterPage(
    manager: EntityManager,
    input: RosterQueryDto,
    scope:
      | { offeringId: string; lecturerId: string }
      | { departmentId: string; semesterId: string },
  ): Promise<RegistrationRosterResponseDto> {
    const teaching = 'offeringId' in scope;
    const filter = teaching
      ? 'o.id = $1 AND o.lecturer_id = $2 AND g.lecturer_id = $2'
      : 't.department_id = $1 AND t.semester_id = $2';
    const values = teaching
      ? [scope.offeringId, scope.lecturerId]
      : [scope.departmentId, scope.semesterId];
    const rows = await manager.query<RosterStudentResponseDto[]>(
      enrollmentProjection +
        `,
        e.student_id AS "studentId", u.first_name AS "firstName", u.last_name AS "lastName",
        m.matric_number AS "matricNumber"
      FROM student_registered_courses e JOIN courses c ON c.id = e.course_id
      JOIN result_groups g ON g.id = e.result_group_id JOIN course_offerings o ON o.id = g.course_offering_id
      JOIN student_register_semesters t ON t.id = e.student_register_semester_id
      JOIN students s ON s.id = e.student_id JOIN users u ON u.id = s.user_id
      LEFT JOIN matric_num_systems m ON m.student_id = s.id
      WHERE ${filter} AND ($3::uuid IS NULL OR e.id > $3)
      ORDER BY e.id LIMIT $4
    `,
      [...values, input.cursor ?? null, input.limit + 1],
    );
    const items = rows.slice(0, input.limit);
    return {
      items,
      nextCursor: rows.length > input.limit ? items.at(-1)!.id : null,
    };
  }
}

function complete(placement: Placement): placement is RequiredPlacement {
  return Boolean(
    placement.facultyId &&
    placement.departmentId &&
    placement.courseOfStudyId &&
    placement.academicLevelId,
  );
}

function requireStudent(actor: AccountPrincipal): void {
  if (actor.role !== 'student')
    throw new ApplicationError(
      HttpStatus.FORBIDDEN,
      'Sign in with a student account to use course registration.',
    );
}
