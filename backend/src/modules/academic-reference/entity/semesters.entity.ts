import { Check, Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';
import type { AcademicSession } from '#modules/academic-reference/entity/academic-sessions.entity.js';

@Entity('semesters')
@Check('chk_semesters_term_number_valid', '"term_number" > 0')
@Check('chk_semesters_max_units_valid', '"max_units" > 0')
@Check('chk_semesters_status', "\"status\" IN ('active', 'inactive')")
@Unique('uq_semesters_academic_session_id_term_number', [
  'academicSessionId',
  'termNumber',
])
export class Semester extends MutableRecord {
  /** Groups the term with other semesters in its academic year. */
  @Column({ name: 'academic_session_id', type: 'uuid' })
  academicSessionId!: string;

  @ManyToOne('AcademicSession', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'academic_session_id',
    foreignKeyConstraintName: 'fk_semesters_academic_session_id',
  })
  academicSession?: AcademicSession;

  /** Orders terms within a session. */
  @Column({ name: 'term_number', type: 'smallint' })
  termNumber!: number;

  /** Names the term for display. */
  @Column({ name: 'name', type: 'text' })
  name!: string;

  /** Limits the credit units a student can register for this term. */
  @Column({ name: 'max_units', type: 'smallint' })
  maxUnits!: number;

  /** Controls availability for new academic operations. */
  @Column({ name: 'status', type: 'text', default: 'inactive' })
  status!: 'active' | 'inactive';
}
