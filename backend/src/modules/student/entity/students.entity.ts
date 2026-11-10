import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';
import type { User } from '#modules/user/entity/users.entity.js';
import type { AcademicLevel } from '#modules/academic-reference/entity/academic-levels.entity.js';
import type { CourseOfStudy } from '#modules/academic-reference/entity/courses-of-study.entity.js';
import type { Department } from '#modules/academic-reference/entity/departments.entity.js';
import type { Faculty } from '#modules/academic-reference/entity/faculties.entity.js';
import type { MatricNumSystem } from '#modules/student/entity/matric-num-systems.entity.js';

@Entity('students')
export class Student extends MutableRecord {
  /** Links the profile to its student account. */
  @Column({ name: 'user_id', type: 'uuid', update: false })
  userId!: string;

  @OneToOne('User', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_students_user_id',
  })
  user?: User;

  /** Records the student’s current academic level. */
  @Column({ name: 'academic_level_id', type: 'uuid', nullable: true })
  academicLevelId!: string | null;

  @ManyToOne('AcademicLevel', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'academic_level_id',
    foreignKeyConstraintName: 'fk_students_academic_level_id',
  })
  academicLevel?: AcademicLevel | null;

  /** Records the programme that controls course eligibility. */
  @Column({ name: 'course_of_study_id', type: 'uuid', nullable: true })
  courseOfStudyId!: string | null;

  @ManyToOne('CourseOfStudy', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'course_of_study_id',
    foreignKeyConstraintName: 'fk_students_course_of_study_id',
  })
  courseOfStudy?: CourseOfStudy | null;

  /** Records the department administering the current placement. */
  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId!: string | null;

  @ManyToOne('Department', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'department_id',
    foreignKeyConstraintName: 'fk_students_department_id',
  })
  department?: Department | null;

  /** Records the faculty that supplies the current registration term. */
  @Column({ name: 'faculty_id', type: 'uuid', nullable: true })
  facultyId!: string | null;

  @ManyToOne('Faculty', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'faculty_id',
    foreignKeyConstraintName: 'fk_students_faculty_id',
  })
  faculty?: Faculty | null;

  @OneToOne('MatricNumSystem', 'student')
  matricNumSys?: MatricNumSystem;
}
