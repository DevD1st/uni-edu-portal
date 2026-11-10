import {
  Check,
  Column,
  Entity,
  ForeignKey,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';
import type { Student } from '#modules/student/entity/students.entity.js';
import type { Course } from '#modules/course/entity/courses.entity.js';
import type { StudentRegisterSemester } from '#modules/registration/entity/student-register-semesters.entity.js';
import type { ResultGroup } from '#modules/results/entity/result-groups.entity.js';
import type { User } from '#modules/user/entity/users.entity.js';
import type { GradeSystem } from '#modules/grading/entity/grade-systems.entity.js';

@Entity('student_registered_courses')
@ForeignKey(
  'StudentRegisterSemester',
  ['studentRegisterSemesterId', 'studentId'],
  ['id', 'studentId'],
  { name: 'fk_enrollment_term_student', onDelete: 'RESTRICT' },
)
@Check(
  'chk_student_registered_courses_registered_units_valid',
  '"registered_units" > 0',
)
@Check(
  'chk_student_registered_courses_ca_score_valid',
  '"ca_score" BETWEEN 0 AND 100',
)
@Check(
  'chk_student_registered_courses_exam_score_valid',
  '"exam_score" BETWEEN 0 AND 100',
)
@Unique('uq_student_registered_courses_student_register_semeste_fd2b7f07', [
  'studentRegisterSemesterId',
  'courseId',
])
@Index('idx_student_registered_courses_result_group_id', ['resultGroupId'])
export class StudentRegisteredCourse extends MutableRecord {
  /** Identifies the student registered for this course. */
  @Column({ name: 'student_id', type: 'uuid', update: false })
  studentId!: string;

  @ManyToOne('Student', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'student_id',
    foreignKeyConstraintName: 'fk_student_registered_courses_student_id',
  })
  student?: Student;

  /** Identifies the catalog course for duplicate prevention and reporting. */
  @Column({ name: 'course_id', type: 'uuid', update: false })
  courseId!: string;

  @ManyToOne('Course', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'course_id',
    foreignKeyConstraintName: 'fk_student_registered_courses_course_id',
  })
  course?: Course;

  /** Links the registration to the student’s semester snapshot. */
  @Column({ name: 'student_register_semester_id', type: 'uuid', update: false })
  studentRegisterSemesterId!: string;

  @ManyToOne('StudentRegisterSemester', {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'student_register_semester_id',
    foreignKeyConstraintName:
      'fk_student_registered_courses_student_register_semester_id',
  })
  studentRegisterSemester?: StudentRegisterSemester;

  /** Places this enrollment on the offering’s grading roster. */
  @Column({ name: 'result_group_id', type: 'uuid', update: false })
  resultGroupId!: string;

  @ManyToOne('ResultGroup', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'result_group_id',
    foreignKeyConstraintName: 'fk_student_registered_courses_result_group_id',
  })
  resultGroup?: ResultGroup;

  /** Records the student or administrator who made the registration. */
  @Column({ name: 'registered_by_user_id', type: 'uuid', update: false })
  registeredByUserId!: string;

  @ManyToOne('User', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'registered_by_user_id',
    foreignKeyConstraintName:
      'fk_student_registered_courses_registered_by_user_id',
  })
  registeredByUser?: User;

  /** Snapshots the units used for the registration total and GPA. */
  @Column({ name: 'registered_units', type: 'smallint', update: false })
  registeredUnits!: number;

  /** Stores the CA mark, with null meaning it has not been entered. */
  @Column({
    name: 'ca_score',
    type: 'numeric',
    nullable: true,
    precision: 5,
    scale: 2,
  })
  caScore!: string | null;

  /** Stores the exam mark, with null meaning it has not been entered. */
  @Column({
    name: 'exam_score',
    type: 'numeric',
    nullable: true,
    precision: 5,
    scale: 2,
  })
  examScore!: string | null;

  /** Identifies the grade band awarded on result approval. */
  @Column({ name: 'awarded_grade_system_id', type: 'uuid', nullable: true })
  awardedGradeSystemId!: string | null;

  @ManyToOne('GradeSystem', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'awarded_grade_system_id',
    foreignKeyConstraintName:
      'fk_student_registered_courses_awarded_grade_system_id',
  })
  awardedGradeSystem?: GradeSystem | null;
}
