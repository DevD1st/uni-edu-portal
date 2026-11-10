import { Check, Column, Entity, Unique } from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';

@Entity('academic_levels')
@Check(
  'chk_academic_levels_program_type',
  "\"program_type\" IN ('undergrad', 'postgrad', 'masters', 'doctorate')",
)
@Check('chk_academic_levels_stage_valid', '"stage" BETWEEN 0 AND 6')
@Check('chk_academic_levels_status', "\"status\" IN ('active', 'inactive')")
@Unique('uq_academic_levels_program_type_stage', ['programType', 'stage'])
export class AcademicLevel extends MutableRecord {
  /** Identifies the university programme family. */
  @Column({ name: 'program_type', type: 'text', update: false })
  programType!: 'undergrad' | 'postgrad' | 'masters' | 'doctorate';

  /** Records the study stage, with zero reserved for Graduate. */
  @Column({ name: 'stage', type: 'smallint', update: false })
  stage!: number;

  /** Supplies the label shown on selectors and reports. */
  @Column({ name: 'display_name', type: 'varchar', length: 100 })
  displayName!: string;

  /** Controls availability for new academic operations. */
  @Column({ name: 'status', type: 'text', default: 'active' })
  status!: 'active' | 'inactive';
}
