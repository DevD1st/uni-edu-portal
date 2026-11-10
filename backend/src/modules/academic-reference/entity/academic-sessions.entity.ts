import { Check, Column, Entity, Unique } from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';

@Entity('academic_sessions')
@Check(
  'chk_academic_sessions_start_year_valid',
  '"start_year" BETWEEN 1000 AND 9999',
)
@Check(
  'chk_academic_sessions_end_year_valid',
  '"end_year" BETWEEN "start_year" AND 9999',
)
@Check('chk_academic_sessions_status', "\"status\" IN ('active', 'inactive')")
@Unique('uq_academic_sessions_start_year_end_year', ['startYear', 'endYear'])
export class AcademicSession extends MutableRecord {
  /** Records the first calendar year of the session. */
  @Column({ name: 'start_year', type: 'smallint' })
  startYear!: number;

  /** Records the last calendar year of the session. */
  @Column({ name: 'end_year', type: 'smallint' })
  endYear!: number;

  /** Controls availability for new academic operations. */
  @Column({ name: 'status', type: 'text', default: 'inactive' })
  status!: 'active' | 'inactive';
}
