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
import type { Department } from '#modules/academic-reference/entity/departments.entity.js';

@Entity('courses_of_study')
@Check(
  'chk_courses_of_study_program_type',
  "\"program_type\" IN ('undergrad', 'postgrad', 'masters', 'doctorate')",
)
@Check('chk_courses_of_study_status', "\"status\" IN ('active', 'inactive')")
@Check('chk_courses_of_study_short_id_positive', '"short_id" > 0')
@Unique('uq_courses_of_study_short_id', ['shortId'])
@Index('uq_courses_of_study_department_name', { synchronize: false })
export class CourseOfStudy extends MutableRecord {
  /** Identifies the department that administers the programme. */
  @Column({ name: 'department_id', type: 'uuid' })
  departmentId!: string;

  @ManyToOne('Department', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'department_id',
    foreignKeyConstraintName: 'fk_courses_of_study_department_id',
  })
  department?: Department;

  /** Supplies the programme name shown in the academic directory. */
  @Column({ name: 'name', type: 'text' })
  name!: string;

  /** Limits student placements to levels in the same programme family. */
  @Column({ name: 'program_type', type: 'text', update: false })
  programType!: 'undergrad' | 'postgrad' | 'masters' | 'doctorate';

  /** Controls availability for new academic operations. */
  @Column({ name: 'status', type: 'text', default: 'active' })
  status!: 'active' | 'inactive';

  /** Supplies the programme segment of a matriculation number. */
  @Column({
    name: 'short_id',
    type: 'integer',
    update: false,
    generated: 'identity',
    insert: false,
  })
  shortId!: number;
}
