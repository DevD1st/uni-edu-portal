import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { ApplicationError } from '#core/http/application-error.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';
import type {
  PublishedCourseResultDto,
  StudentResultHistoryDto,
  StudentResultStatementDto,
  StudentResultTermDto,
} from '../dtos/student-results.dto.js';

type TermTotals = Omit<StudentResultStatementDto, 'courses'>;

// Both totals and statements use the awarded band from the pinned policy and the group's current state.
const publishedJoins = `
  FROM student_registered_courses e
  JOIN result_groups g ON g.id = e.result_group_id AND g.status = 'approved'
  JOIN course_offerings o ON o.id = g.course_offering_id
  JOIN grade_systems band ON band.id = e.awarded_grade_system_id AND band.grading_policy_id = o.grading_policy_id
`;

@Injectable()
export class StudentResultsService {
  constructor(private readonly database: DataSource) {}

  async history(actor: AccountPrincipal): Promise<StudentResultHistoryDto> {
    requireStudent(actor);
    const terms = await this.termTotals(this.database.manager, actor.userId);
    return { cgpa: terms[0]?.cgpa ?? null, terms };
  }

  statement(
    actor: AccountPrincipal,
    semesterId: string,
  ): Promise<StudentResultStatementDto> {
    requireStudent(actor);
    // A reopen or approval must not appear between the totals and course rows in a statement.
    return this.database.transaction('REPEATABLE READ', async (manager) => {
      const terms = await this.termTotals(manager, actor.userId);
      const term = terms.find((entry) => entry.semesterId === semesterId);
      if (!term)
        throw new ApplicationError(
          HttpStatus.NOT_FOUND,
          'No academic record was found for this semester.',
        );
      const courses = await manager.query<PublishedCourseResultDto[]>(
        `
        SELECT e.id, c.code, c.name, e.registered_units AS units,
          e.ca_score::float8 AS "caScore", e.exam_score::float8 AS "examScore",
          (e.ca_score + e.exam_score)::float8 AS "totalScore",
          band.grade, band.point::float8 AS "gradePoint", g.approved_at AS "approvedAt"
        ` +
          publishedJoins +
          `
        JOIN courses c ON c.id = e.course_id
        WHERE e.student_register_semester_id = $1 ORDER BY c.code, e.id
      `,
        [term.id],
      );
      return { ...term, courses };
    });
  }

  private termTotals(
    manager: EntityManager,
    userId: string,
  ): Promise<(StudentResultTermDto & TermTotals)[]> {
    // Keep PostgreSQL numeric precision through the weighted sums. Round only the final GPA values.
    return manager.query<TermTotals[]>(
      `
      SELECT t.id, t.semester_id AS "semesterId", sem.name AS "semesterName",
        session.start_year || '/' || session.end_year AS "academicSession",
        d.name AS department, p.name AS programme, l.display_name AS "academicLevel",
        u.first_name AS "firstName", u.last_name AS "lastName", m.matric_number AS "matricNumber",
        COALESCE(marks.units, 0)::int AS "approvedUnits",
        round(marks.weighted / NULLIF(marks.units, 0), 2)::float8 AS gpa,
        round(sum(marks.weighted) OVER () / NULLIF(sum(marks.units) OVER (), 0), 2)::float8 AS cgpa
      FROM student_register_semesters t JOIN students s ON s.id = t.student_id
      JOIN users u ON u.id = s.user_id LEFT JOIN matric_num_systems m ON m.student_id = s.id
      JOIN semesters sem ON sem.id = t.semester_id
      JOIN academic_sessions session ON session.id = sem.academic_session_id
      JOIN departments d ON d.id = t.department_id JOIN courses_of_study p ON p.id = t.course_of_study_id
      JOIN academic_levels l ON l.id = t.academic_level_id
      JOIN LATERAL (
        SELECT sum(e.registered_units) AS units, sum(e.registered_units * band.point) AS weighted
        ` +
        publishedJoins +
        `
        WHERE e.student_register_semester_id = t.id
      ) marks ON true
      WHERE s.user_id = $1
      ORDER BY session.start_year DESC, session.end_year DESC, sem.term_number DESC, t.id
    `,
      [userId],
    );
  }
}

function requireStudent(actor: AccountPrincipal): void {
  if (actor.role !== 'student')
    throw new ApplicationError(
      HttpStatus.FORBIDDEN,
      'Sign in with a student account to view your published results.',
    );
}
