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
import type { Faculty } from '#modules/academic-reference/entity/faculties.entity.js';

@Entity('departments')
@Check('chk_departments_status', "\"status\" IN ('active', 'inactive')")
@Check('chk_departments_short_id_positive', '"short_id" > 0')
@Unique('uq_departments_short_id', ['shortId'])
@Index('uq_departments_faculty_normalized_name', { synchronize: false })
export class Department extends MutableRecord {
  /** Identifies the faculty that owns the department. */
  @Column({ name: 'faculty_id', type: 'uuid' })
  facultyId!: string;

  @ManyToOne('Faculty', { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'faculty_id',
    foreignKeyConstraintName: 'fk_departments_faculty_id',
  })
  faculty?: Faculty;

  /** Names the department within its faculty. */
  @Column({ name: 'name', type: 'text' })
  name!: string;

  /** Controls availability for new academic operations. */
  @Column({ name: 'status', type: 'text', default: 'active' })
  status!: 'active' | 'inactive';

  /** Supplies the department segment of a matriculation number. */
  @Column({
    name: 'short_id',
    type: 'integer',
    update: false,
    generated: 'identity',
    insert: false,
  })
  shortId!: number;
}
