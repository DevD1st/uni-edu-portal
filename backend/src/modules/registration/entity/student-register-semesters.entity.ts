import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';
import type { Student } from '#modules/student/entity/students.entity.js';
import type { Semester } from '#modules/academic-reference/entity/semesters.entity.js';
import type { AcademicLevel } from '#modules/academic-reference/entity/academic-levels.entity.js';
import type { CourseOfStudy } from '#modules/academic-reference/entity/courses-of-study.entity.js';
import type { Department } from '#modules/academic-reference/entity/departments.entity.js';
import type { Faculty } from '#modules/academic-reference/entity/faculties.entity.js';

@Entity('student_register_semesters')
@Unique('uq_student_register_semesters_student_id_semester_id', [
  'studentId',
  'semesterId',
])
@Unique('uq_student_register_semesters_id_student_id', ['id', 'studentId'])
@Index('idx_student_register_semesters_department_id_semester_id', [
  'departmentId',
  'semesterId',
])
export class StudentRegisterSemester extends MutableRecord {
  /** Identifies the student whose semester history is recorded. */
  @Column({ name: 'student_id', type: 'uuid', update: false })
  studentId!: string;

  @ManyToOne('Student', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'student_id',
    foreignKeyConstraintName: 'fk_student_register_semesters_student_id',
  })
  student?: Student;

  /** Identifies the term for unit totals and GPA. */
  @Column({ name: 'semester_id', type: 'uuid', update: false })
  semesterId!: string;

  @ManyToOne('Semester', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'semester_id',
    foreignKeyConstraintName: 'fk_student_register_semesters_semester_id',
  })
  semester?: Semester;

  /** Snapshots the level used when the student first registered. */
  @Column({ name: 'academic_level_id', type: 'uuid', update: false })
  academicLevelId!: string;

  @ManyToOne('AcademicLevel', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'academic_level_id',
    foreignKeyConstraintName: 'fk_student_register_semesters_academic_level_id',
  })
  academicLevel?: AcademicLevel;

  /** Snapshots the programme used for term eligibility. */
  @Column({ name: 'course_of_study_id', type: 'uuid', update: false })
  courseOfStudyId!: string;

  @ManyToOne('CourseOfStudy', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'course_of_study_id',
    foreignKeyConstraintName:
      'fk_student_register_semesters_course_of_study_id',
  })
  courseOfStudy?: CourseOfStudy;

  /** Snapshots the department responsible for this term record. */
  @Column({ name: 'department_id', type: 'uuid', update: false })
  departmentId!: string;

  @ManyToOne('Department', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'department_id',
    foreignKeyConstraintName: 'fk_student_register_semesters_department_id',
  })
  department?: Department;

  /** Snapshots the faculty for historical registration reports. */
  @Column({ name: 'faculty_id', type: 'uuid', update: false })
  facultyId!: string;

  @ManyToOne('Faculty', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'faculty_id',
    foreignKeyConstraintName: 'fk_student_register_semesters_faculty_id',
  })
  faculty?: Faculty;
}
