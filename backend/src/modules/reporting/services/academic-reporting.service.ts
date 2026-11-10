import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { ApplicationError } from '#core/http/application-error.js';
import { AdminAuthorizationService } from '#shared/admin-authorization/admin-authorization.service.js';
import type {
  AcademicOverviewDto,
  AcademicReportQueryDto,
  CoursePerformanceDto,
  CoursePerformancePageDto,
  CourseReportQueryDto,
} from '../dtos/academic-report.dto.js';

// A stored award does not count unless the group is still approved and the award
// uses the offering's policy. Reopening therefore changes reports and statements together.
const publishedGrades = `
  LEFT JOIN grade_systems band ON band.id = e.awarded_grade_system_id
    AND band.grading_policy_id = o.grading_policy_id AND g.status = 'approved'
`;
const performance = `
  count(e.id)::int AS "enrollmentCount",
  count(band.id)::int AS "publishedCount",
  count(band.id) FILTER (WHERE band.grade <> 'F')::int AS "passedCount",
  round(avg(e.ca_score + e.exam_score) FILTER (WHERE band.id IS NOT NULL), 2)::float8 AS "averageScore"
`;

@Injectable()
export class AcademicReportingService {
  constructor(
    private readonly database: DataSource,
    private readonly authorization: AdminAuthorizationService,
  ) {}

  overview(
    actorId: string,
    input: AcademicReportQueryDto,
  ): Promise<AcademicOverviewDto> {
    return this.database.transaction('REPEATABLE READ', async (manager) => {
      const filters = await this.scope(manager, actorId, input);
      const [overview] = await manager.query<AcademicOverviewDto[]>(
        `
        WITH offerings AS (
          SELECT o.id, o.status, o.grading_policy_id, g.id AS group_id,
            g.status AS group_status, g.registration_status
          FROM course_offerings o LEFT JOIN result_groups g ON g.course_offering_id = o.id
          WHERE o.semester_id = $1 AND ($2::uuid IS NULL OR o.department_id = $2)
        ), groups AS (
          SELECT count(*)::int AS "offeringCount",
            count(*) FILTER (WHERE status = 'active')::int AS "activeOfferingCount",
            count(*) FILTER (WHERE registration_status = 'closed')::int AS "closedRosterCount",
            count(*) FILTER (WHERE group_status = 'pending')::int AS "pendingCount",
            count(*) FILTER (WHERE group_status = 'submitted')::int AS "submittedCount",
            count(*) FILTER (WHERE group_status = 'correction_requested')::int AS "correctionRequestedCount",
            count(*) FILTER (WHERE group_status = 'approved')::int AS "approvedCount"
          FROM offerings
        ), enrollments AS (
          SELECT count(DISTINCT e.student_id)::int AS "studentCount", ${performance}
          FROM offerings o JOIN result_groups g ON g.id = o.group_id
          JOIN student_registered_courses e ON e.result_group_id = g.id
          ${publishedGrades}
        )
        SELECT $1::uuid AS "semesterId", $2::uuid AS "departmentId", groups.*, enrollments.*
        FROM groups CROSS JOIN enrollments
        `,
        filters,
      );
      return overview!;
    });
  }

  courses(
    actorId: string,
    input: CourseReportQueryDto,
  ): Promise<CoursePerformancePageDto> {
    return this.database.transaction('REPEATABLE READ', async (manager) => {
      const filters = await this.scope(manager, actorId, input);
      // Page offerings first. Large departments should only aggregate the rosters on this page.
      const rows = await manager.query<CoursePerformanceDto[]>(
        `
        WITH page AS (
          SELECT id, course_id, department_id, academic_level_id, grading_policy_id, status
          FROM course_offerings
          WHERE semester_id = $1 AND ($2::uuid IS NULL OR department_id = $2)
            AND ($3::uuid IS NULL OR id > $3)
          ORDER BY id LIMIT $4
        )
        SELECT o.id AS "offeringId", d.id AS "departmentId", d.name AS department,
          c.code, c.name, l.display_name AS "academicLevel", o.status AS "offeringStatus",
          g.registration_status AS "registrationStatus", g.status AS "resultStatus", totals.*
        FROM page o JOIN courses c ON c.id = o.course_id JOIN departments d ON d.id = o.department_id
        JOIN academic_levels l ON l.id = o.academic_level_id
        LEFT JOIN result_groups g ON g.course_offering_id = o.id
        JOIN LATERAL (
          SELECT ${performance}
          FROM student_registered_courses e ${publishedGrades}
          WHERE e.result_group_id = g.id
        ) totals ON true
        ORDER BY o.id
        `,
        [...filters, input.cursor ?? null, input.limit + 1],
      );
      const items = rows.slice(0, input.limit);
      return {
        items,
        nextCursor: rows.length > input.limit ? items.at(-1)!.offeringId : null,
      };
    });
  }

  private async scope(
    manager: EntityManager,
    actorId: string,
    input: AcademicReportQueryDto,
  ): Promise<[string, string | null]> {
    const { semesterId } = input;
    const departmentId = input.departmentId ?? null;
    // An omitted department asks for the entire university, not all of the caller's grants.
    await this.authorization.require(
      actorId,
      'read_reports',
      departmentId,
      manager,
    );
    const [known] = await manager.query<
      { semester: boolean; department: boolean }[]
    >(
      `SELECT EXISTS (SELECT 1 FROM semesters WHERE id = $1) AS semester,
        ($2::uuid IS NULL OR EXISTS (SELECT 1 FROM departments WHERE id = $2)) AS department`,
      [semesterId, departmentId],
    );
    if (!known?.semester)
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        'The selected semester could not be found.',
      );
    if (!known.department)
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        'The selected department could not be found.',
      );
    return [semesterId, departmentId];
  }
}
