import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Unique,
} from 'typeorm';
import { CreatedRecord } from '#core/database/base.entity.js';
import type { Student } from '#modules/student/entity/students.entity.js';
import type { Faculty } from '#modules/academic-reference/entity/faculties.entity.js';
import type { Department } from '#modules/academic-reference/entity/departments.entity.js';
import type { CourseOfStudy } from '#modules/academic-reference/entity/courses-of-study.entity.js';

@Entity('matric_num_systems')
@Check(
  'chk_matric_num_systems_issued_year_valid',
  '"issued_year" BETWEEN 1000 AND 9999',
)
@Check('chk_matric_num_systems_short_id_positive', '"short_id" > 0')
@Unique('uq_matric_num_systems_short_id', ['shortId'])
@Unique('uq_matric_num_systems_matric_number', ['matricNumber'])
export class MatricNumSystem extends CreatedRecord {
  /** Links the issuance record to one student. */
  @Column({ name: 'student_id', type: 'uuid', update: false })
  studentId!: string;

  @OneToOne('Student', 'matricNumSys', {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'student_id',
    foreignKeyConstraintName: 'fk_matric_num_systems_student_id',
  })
  student?: Student;

  /** Snapshots the faculty used to issue the number. */
  @Column({ name: 'faculty_id', type: 'uuid', update: false })
  facultyId!: string;

  @ManyToOne('Faculty', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'faculty_id',
    foreignKeyConstraintName: 'fk_matric_num_systems_faculty_id',
  })
  faculty?: Faculty;

  /** Snapshots the department used to issue the number. */
  @Column({ name: 'department_id', type: 'uuid', update: false })
  departmentId!: string;

  @ManyToOne('Department', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'department_id',
    foreignKeyConstraintName: 'fk_matric_num_systems_department_id',
  })
  department?: Department;

  /** Snapshots the programme used to issue the number. */
  @Column({ name: 'course_of_study_id', type: 'uuid', update: false })
  courseOfStudyId!: string;

  @ManyToOne('CourseOfStudy', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'course_of_study_id',
    foreignKeyConstraintName: 'fk_matric_num_systems_course_of_study_id',
  })
  courseOfStudy?: CourseOfStudy;

  /** Stores the Lagos calendar year used in the matriculation number. */
  @Column({ name: 'issued_year', type: 'smallint', update: false })
  issuedYear!: number;

  /** Provides the nonreusable final sequence segment. */
  @Column({
    name: 'short_id',
    type: 'integer',
    update: false,
    generated: 'identity',
    insert: false,
  })
  shortId!: number;

  /** Stores the issued number until account redaction removes the issuance row. */
  @Column({ name: 'matric_number', type: 'text', update: false })
  matricNumber!: string;
}
