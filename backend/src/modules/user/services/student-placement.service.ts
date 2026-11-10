import { ApplicationError } from '#core/http/application-error.js';
import { Injectable, HttpStatus } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import type { PlacementDto } from '#shared/auth/student-account.dto.js';
import type { AcademicLevel } from '#modules/academic-reference/entity/academic-levels.entity.js';
import type { CourseOfStudy } from '#modules/academic-reference/entity/courses-of-study.entity.js';
import type { Department } from '#modules/academic-reference/entity/departments.entity.js';
import type { Faculty } from '#modules/academic-reference/entity/faculties.entity.js';
import type { MatricNumSystem } from '#modules/student/entity/matric-num-systems.entity.js';
import type { Student } from '#modules/student/entity/students.entity.js';

@Injectable()
export class StudentPlacementService {
  async resolve(
    manager: EntityManager,
    input: PlacementDto,
    allowGraduate: boolean,
  ) {
    const academicLevelId = input.academicLevelId ?? null;
    const courseOfStudyId = input.courseOfStudyId ?? null;
    const programme =
      courseOfStudyId &&
      (await manager
        .getRepository<CourseOfStudy>('CourseOfStudy')
        .findOneBy({ id: courseOfStudyId, status: 'active' }));
    if (courseOfStudyId && !programme)
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        'Programme is unavailable',
      );
    const departmentId =
      input.departmentId ?? (programme ? programme.departmentId : null);
    const department =
      departmentId &&
      (await manager
        .getRepository<Department>('Department')
        .findOneBy({ id: departmentId, status: 'active' }));
    if (
      (departmentId && !department) ||
      (programme && programme.departmentId !== departmentId)
    ) {
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        'Department does not match the selected programme',
      );
    }
    const facultyId =
      input.facultyId ?? (department ? department.facultyId : null);
    const faculty =
      facultyId &&
      (await manager
        .getRepository<Faculty>('Faculty')
        .findOneBy({ id: facultyId, status: 'active' }));
    if (
      (facultyId && !faculty) ||
      (department && department.facultyId !== facultyId)
    ) {
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        'Faculty does not match the selected department',
      );
    }
    const level =
      academicLevelId &&
      (await manager
        .getRepository<AcademicLevel>('AcademicLevel')
        .findOneBy({ id: academicLevelId, status: 'active' }));
    if (
      (academicLevelId && !level) ||
      (level && !allowGraduate && level.stage === 0) ||
      (programme && level && programme.programType !== level.programType)
    ) {
      throw new ApplicationError(
        HttpStatus.BAD_REQUEST,
        'Level is unavailable for this programme',
      );
    }
    return { academicLevelId, courseOfStudyId, departmentId, facultyId };
  }

  async issueMatriculation(
    manager: EntityManager,
    student: Student,
  ): Promise<string | null> {
    const { facultyId, departmentId, courseOfStudyId } = student;
    const existing = await manager
      .getRepository<MatricNumSystem>('MatricNumSystem')
      .findOneBy({ studentId: student.id });
    if (existing) return existing.matricNumber;
    if (!facultyId || !departmentId || !courseOfStudyId) return null;

    // The account transaction owns this student's placement. Reserve the sequence before composing the identifier.
    const [segments] = (await manager.query(
      `SELECT f.short_id AS faculty, d.short_id AS department, p.short_id AS programme,
              nextval(pg_get_serial_sequence('matric_num_systems', 'short_id'))::int AS sequence,
              extract(year FROM now() AT TIME ZONE 'Africa/Lagos')::int AS year
         FROM faculties f, departments d, courses_of_study p
        WHERE f.id = $1 AND d.id = $2 AND p.id = $3`,
      [facultyId, departmentId, courseOfStudyId],
    )) as [
      {
        faculty: number;
        department: number;
        programme: number;
        sequence: number;
        year: number;
      },
    ];
    const number = [
      String(segments.year).slice(-2),
      segments.faculty,
      segments.department,
      segments.programme,
      segments.sequence,
    ].join('/');
    await manager.query(
      `INSERT INTO matric_num_systems
         (id, student_id, faculty_id, department_id, course_of_study_id, issued_year, short_id, matric_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        uuidv7(),
        student.id,
        facultyId,
        departmentId,
        courseOfStudyId,
        segments.year,
        segments.sequence,
        number,
      ],
    );
    return number;
  }
}
