import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';
import type { Course } from '#modules/course/entity/courses.entity.js';
import type { Department } from '#modules/academic-reference/entity/departments.entity.js';
import type { Semester } from '#modules/academic-reference/entity/semesters.entity.js';
import type { AcademicLevel } from '#modules/academic-reference/entity/academic-levels.entity.js';
import type { Admin } from '#modules/admin/entity/admins.entity.js';
import type { GradingPolicy } from '#modules/grading/entity/grading-policies.entity.js';

@Entity('course_offerings')
@Check('chk_course_offerings_units_valid', '"units" > 0')
@Check('chk_course_offerings_status', "\"status\" IN ('active', 'inactive')")
@Unique('uq_course_offerings_course_id_department_id_semester_i_1ea71667', [
  'courseId',
  'departmentId',
  'semesterId',
  'academicLevelId',
])
@Index('idx_course_offerings_department_id_semester_id_academi_b3342ea6', [
  'departmentId',
  'semesterId',
  'academicLevelId',
])
@Index('idx_course_offerings_lecturer_id_semester_id', [
  'lecturerId',
  'semesterId',
])
@Check(
  'chk_course_offerings_active_lecturer',
  '"status" <> \'active\' OR "lecturer_id" IS NOT NULL',
)
export class CourseOffering extends MutableRecord {
  /** Identifies the catalog course being delivered. */
  @Column({ name: 'course_id', type: 'uuid' })
  courseId!: string;

  @ManyToOne('Course', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'course_id',
    foreignKeyConstraintName: 'fk_course_offerings_course_id',
  })
  course?: Course;

  /** Owns the delivery, roster, and result approval. */
  @Column({ name: 'department_id', type: 'uuid' })
  departmentId!: string;

  @ManyToOne('Department', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'department_id',
    foreignKeyConstraintName: 'fk_course_offerings_department_id',
  })
  department?: Department;

  /** Identifies the delivery term. */
  @Column({ name: 'semester_id', type: 'uuid' })
  semesterId!: string;

  @ManyToOne('Semester', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'semester_id',
    foreignKeyConstraintName: 'fk_course_offerings_semester_id',
  })
  semester?: Semester;

  /** Identifies the level eligible for the delivery. */
  @Column({ name: 'academic_level_id', type: 'uuid' })
  academicLevelId!: string;

  @ManyToOne('AcademicLevel', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'academic_level_id',
    foreignKeyConstraintName: 'fk_course_offerings_academic_level_id',
  })
  academicLevel?: AcademicLevel;

  /** Identifies the lecturer allocated to the offering. */
  @Column({ name: 'lecturer_id', type: 'uuid', nullable: true })
  lecturerId!: string | null;

  @ManyToOne('Admin', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'lecturer_id',
    foreignKeyConstraintName: 'fk_course_offerings_lecturer_id',
  })
  lecturer?: Admin | null;

  /** Snapshots the credit value selected for this delivery. */
  @Column({ name: 'units', type: 'smallint' })
  units!: number;

  /** Pins the grading policy used for this offering. */
  @Column({ name: 'grading_policy_id', type: 'uuid' })
  gradingPolicyId!: string;

  @ManyToOne('GradingPolicy', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'grading_policy_id',
    foreignKeyConstraintName: 'fk_course_offerings_grading_policy_id',
  })
  gradingPolicy?: GradingPolicy;

  /** Controls availability for new academic operations. */
  @Column({ name: 'status', type: 'text', default: 'inactive' })
  status!: 'active' | 'inactive';
}
