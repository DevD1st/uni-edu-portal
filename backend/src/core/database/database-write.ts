import { HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { DataSource, EntityManager } from 'typeorm';
import { ApplicationError } from '../http/application-error.js';

const constraintMessages = new Map([
  ['uq_users_email_role', 'This email already has an account of that type.'],
  ['uq_roles_name', 'A role with this name already exists.'],
  ['uq_faculties_normalized_name', 'A faculty with this name already exists.'],
  [
    'uq_departments_faculty_normalized_name',
    'A department with this name already exists in the faculty.',
  ],
  [
    'uq_courses_of_study_department_name',
    'A programme with this name already exists in the department.',
  ],
  [
    'uq_academic_sessions_start_year_end_year',
    'An academic session for these years already exists.',
  ],
  [
    'uq_semesters_academic_session_id_term_number',
    'This academic session already has a semester with this number.',
  ],
  ['uq_courses_code', 'A course with this code already exists.'],
  [
    'uq_course_of_study_courses_course_of_study_id_course_id',
    'This course is already in the programme curriculum.',
  ],
  [
    'uq_course_offerings_course_id_department_id_semester_i_1ea71667',
    'The course already has an offering in this department, semester, and level.',
  ],
  [
    'uq_student_registered_courses_student_register_semeste_fd2b7f07',
    'This course is already registered in this semester.',
  ],
  [
    'uq_admin_roles_global',
    'This administrator already has this university-wide role.',
  ],
  [
    'uq_admin_roles_department',
    'This administrator already has this role in the selected department.',
  ],
  [
    'uq_matric_num_systems_student_id',
    'This student already has a matriculation number.',
  ],
  [
    'chk_roles_name_valid',
    'Use lowercase letters and digits, with single hyphens between words, for the role name.',
  ],
  [
    'chk_roles_privileges',
    'Choose privileges listed in the API documentation.',
  ],
]);

export function mapDatabaseWriteError(
  error: unknown,
): ApplicationError | undefined {
  if (!(error instanceof QueryFailedError)) return undefined;
  const { code, constraint } = error.driverError as {
    code?: string;
    constraint?: string;
  };
  const message = constraint ? constraintMessages.get(constraint) : undefined;
  if (code === '23505' || code === '23P01') {
    return new ApplicationError(
      HttpStatus.CONFLICT,
      message ??
        'This change conflicts with an existing record. Review the values and try again.',
      undefined,
      error,
    );
  }
  if (code === '23503' || code === '23001') {
    return new ApplicationError(
      HttpStatus.CONFLICT,
      'A related record is missing or still in use. Refresh the records and try again.',
      undefined,
      error,
    );
  }
  if (code?.startsWith('23')) {
    return new ApplicationError(
      HttpStatus.BAD_REQUEST,
      message ??
        'One or more values do not meet the requirements for this change. Check your input and try again.',
      undefined,
      error,
    );
  }
  if (code === '40001' || code === '40P01') {
    return new ApplicationError(
      HttpStatus.CONFLICT,
      'Another request changed these records at the same time. Please try again.',
      undefined,
      error,
    );
  }
  return undefined;
}

export async function databaseWrite<T>(write: () => Promise<T>): Promise<T> {
  try {
    return await write();
  } catch (error: unknown) {
    // PostgreSQL details can contain personal data. Only publish the mapped message.
    throw mapDatabaseWriteError(error) ?? error;
  }
}

export function writeTransaction<T>(
  database: DataSource,
  write: (manager: EntityManager) => Promise<T>,
): Promise<T> {
  // Catch constraints checked at commit as well as failures from individual writes.
  return databaseWrite(() => database.transaction(write));
}
