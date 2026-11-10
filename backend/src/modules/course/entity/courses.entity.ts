import { Check, Column, Entity, Unique } from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';

@Entity('courses')
@Check(
  'chk_courses_code_valid',
  '"code" = upper(btrim("code")) AND length("code") > 0',
)
@Check('chk_courses_units_valid', '"units" > 0')
@Check('chk_courses_status', "\"status\" IN ('active', 'inactive')")
@Unique('uq_courses_code', ['code'])
export class Course extends MutableRecord {
  /** Supplies the catalog course title. */
  @Column({ name: 'name', type: 'text' })
  name!: string;

  /** Identifies the catalog course across departments. */
  @Column({ name: 'code', type: 'text' })
  code!: string;

  /** Defines the default credit value copied to new offerings. */
  @Column({ name: 'units', type: 'smallint' })
  units!: number;

  /** Controls availability for new academic operations. */
  @Column({ name: 'status', type: 'text', default: 'active' })
  status!: 'active' | 'inactive';
}
