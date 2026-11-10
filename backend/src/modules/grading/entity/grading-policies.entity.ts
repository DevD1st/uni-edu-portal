import { Check, Column, Entity, Index, Unique } from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';

@Entity('grading_policies')
@Check('chk_grading_policies_version_valid', '"version" > 0')
@Check('chk_grading_policies_max_ca_score_valid', '"max_ca_score" > 0')
@Check('chk_grading_policies_max_exam_score_valid', '"max_exam_score" > 0')
@Check(
  'chk_grading_policies_status',
  "\"status\" IN ('draft', 'active', 'retired')",
)
@Unique('uq_grading_policies_version', ['version'])
@Index('uq_grading_policies_active', ['status'], {
  unique: true,
  where: '"status" = \'active\'',
})
@Check(
  'chk_grading_policies_max_total',
  '"max_ca_score" + "max_exam_score" = 100',
)
export class GradingPolicy extends MutableRecord {
  /** Identifies a published grading configuration. */
  @Column({ name: 'version', type: 'integer', update: false })
  version!: number;

  /** Names the scale for administrators. */
  @Column({ name: 'name', type: 'text' })
  name!: string;

  /** Sets the maximum continuous assessment mark. */
  @Column({ name: 'max_ca_score', type: 'numeric', precision: 5, scale: 2 })
  maxCaScore!: string;

  /** Sets the maximum exam mark. */
  @Column({ name: 'max_exam_score', type: 'numeric', precision: 5, scale: 2 })
  maxExamScore!: string;

  /** Controls editing, use as the active default, and retirement. */
  @Column({ name: 'status', type: 'text', default: 'draft' })
  status!: 'draft' | 'active' | 'retired';
}
