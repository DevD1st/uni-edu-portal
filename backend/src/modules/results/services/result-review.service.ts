import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { ApplicationError } from '#core/http/application-error.js';
import { AdminAuthorizationService } from '#shared/admin-authorization/admin-authorization.service.js';
import { authorizedDepartments } from '#shared/admin-authorization/privilege.js';
import type {
  ResultGroupDetailDto,
  ResultGroupPageDto,
  ResultGroupSummaryDto,
  ResultMarkResponseDto,
} from '../dtos/result-review.dto.js';
import type {
  DepartmentResultsQueryDto,
  LecturerResultsQueryDto,
  ResultPageQueryDto,
} from '../dtos/result-write.dto.js';
import { ResultAccessService } from './result-access.service.js';
import type {
  ResultReviewDepartmentDto,
  ResultReviewOptionsDto,
} from '../dtos/result-options.dto.js';

const projection = `
SELECT g.id, o.id AS "offeringId", o.department_id AS "departmentId",
  o.semester_id AS "semesterId", g.lecturer_id AS "lecturerId", c.code, c.name,
  g.status, g.registration_status AS "registrationStatus", g.submitted_at AS "submittedAt",
  g.approved_at AS "approvedAt", g.correction_requested_at AS "correctionRequestedAt",
  g.submission_reason AS "submissionReason", g.approval_reason AS "approvalReason",
  g.correction_request_reason AS "correctionRequestReason",
  p.max_ca_score::float8 AS "maxCaScore", p.max_exam_score::float8 AS "maxExamScore",
  stats."enrolledCount", stats."markedCount", stats."averageScore"
FROM result_groups g JOIN course_offerings o ON o.id = g.course_offering_id
JOIN courses c ON c.id = o.course_id JOIN grading_policies p ON p.id = o.grading_policy_id
JOIN LATERAL (
  SELECT count(*)::int AS "enrolledCount", count(e.ca_score + e.exam_score)::int AS "markedCount",
    round(avg(e.ca_score + e.exam_score), 2)::float8 AS "averageScore"
  FROM student_registered_courses e WHERE e.result_group_id = g.id
) stats ON true
`;

@Injectable()
export class ResultReviewService {
  constructor(
    private readonly database: DataSource,
    private readonly authorization: AdminAuthorizationService,
    private readonly access: ResultAccessService,
  ) {}

  options(actorId: string): Promise<ResultReviewOptionsDto> {
    return this.database.transaction('REPEATABLE READ', async (manager) => {
      const access = await this.authorization.resolve(actorId, manager);
      const grants = access.grants.filter(({ privileges }) =>
        privileges.some(
          (privilege) =>
            privilege === 'review_result' ||
            privilege === 'approve_result' ||
            privilege === 'reopen_result',
        ),
      );
      if (!grants.length)
        throw new ApplicationError(
          HttpStatus.FORBIDDEN,
          'You do not have permission to review results in any department.',
        );
      const scope = grants.some(({ departmentId }) => departmentId === null)
        ? null
        : [...new Set(grants.map(({ departmentId }) => departmentId))];
      // Deactivation stops new academic setup; it must not hide retained results from their reviewers.
      const departments = await manager.query<ResultReviewDepartmentDto[]>(
        'SELECT id, name FROM departments WHERE $1::uuid[] IS NULL OR id = ANY($1::uuid[]) ORDER BY name, id',
        [scope],
      );
      return { departments };
    });
  }

  listForLecturer(
    actorId: string,
    query: LecturerResultsQueryDto,
  ): Promise<ResultGroupPageDto> {
    return this.database.transaction('REPEATABLE READ', async (manager) => {
      const access = await this.authorization.requireAnyScope(
        actorId,
        'teach_course',
        manager,
      );
      return this.list(
        manager,
        query,
        access.adminId,
        authorizedDepartments(access, 'teach_course'),
      );
    });
  }

  listForDepartment(
    actorId: string,
    query: DepartmentResultsQueryDto,
  ): Promise<ResultGroupPageDto> {
    return this.database.transaction('REPEATABLE READ', async (manager) => {
      await this.access.department(actorId, query.departmentId, manager);
      return this.list(
        manager,
        { ...query, status: query.status ?? 'submitted' },
        null,
        [query.departmentId],
      );
    });
  }

  detail(
    actorId: string,
    id: string,
    query: ResultPageQueryDto,
    scope: 'teaching' | 'department',
  ): Promise<ResultGroupDetailDto> {
    return this.database.transaction('REPEATABLE READ', async (manager) => {
      const context = await this.access.load(actorId, id, scope, manager);
      const { offering } = context;
      const [group] = await manager.query<
        Omit<
          ResultGroupDetailDto,
          'marks' | 'nextCursor' | 'canApprove' | 'approvalBlockedReason'
        >[]
      >(projection + ' WHERE g.id = $1', [id]);
      const rows = await manager.query<ResultMarkResponseDto[]>(
        `
        SELECT e.id, e.student_id AS "studentId", u.first_name AS "firstName",
          u.last_name AS "lastName", m.matric_number AS "matricNumber",
          e.ca_score::float8 AS "caScore", e.exam_score::float8 AS "examScore",
          (e.ca_score + e.exam_score)::float8 AS "totalScore", band.grade,
          band.point::float8 AS "gradePoint"
        FROM student_registered_courses e JOIN students s ON s.id = e.student_id
        JOIN users u ON u.id = s.user_id LEFT JOIN matric_num_systems m ON m.student_id = s.id
        LEFT JOIN grade_systems band ON band.grading_policy_id = $2 AND (
          band.id = e.awarded_grade_system_id OR
          (e.awarded_grade_system_id IS NULL AND e.ca_score + e.exam_score BETWEEN band.min_score AND band.max_score)
        )
        WHERE e.result_group_id = $1 AND ($3::uuid IS NULL OR e.id > $3)
        ORDER BY e.id LIMIT $4
      `,
        [id, offering.gradingPolicyId, query.cursor ?? null, query.limit + 1],
      );
      const page = pageOf(rows, query.limit);
      return {
        ...group,
        ...(await this.access.approvalEligibility(context, manager)),
        marks: page.items,
        nextCursor: page.nextCursor,
      };
    });
  }

  private async list(
    manager: EntityManager,
    query: LecturerResultsQueryDto,
    lecturerId: string | null,
    departmentIds: string[] | null,
  ) {
    const rows = await manager.query<ResultGroupSummaryDto[]>(
      projection +
        `
      WHERE (
        ($1::uuid IS NULL AND g.submitted_at IS NOT NULL)
        OR ($1::uuid IS NOT NULL AND g.lecturer_id = $1 AND o.lecturer_id = $1)
      )
      AND ($2::uuid[] IS NULL OR o.department_id = ANY($2::uuid[]))
      AND ($3::text IS NULL OR g.status = $3)
      AND ($4::uuid IS NULL OR o.semester_id = $4)
      AND ($5::uuid IS NULL OR g.id > $5)
      ORDER BY g.id LIMIT $6
    `,
      [
        lecturerId,
        departmentIds,
        query.status ?? null,
        query.semesterId ?? null,
        query.cursor ?? null,
        query.limit + 1,
      ],
    );
    return pageOf(rows, query.limit);
  }
}

function pageOf<T extends { id: string }>(rows: T[], limit: number) {
  const items = rows.slice(0, limit);
  return { items, nextCursor: rows.length > limit ? items.at(-1)!.id : null };
}
