import { Check, Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';
import type { GradingPolicy } from '#modules/grading/entity/grading-policies.entity.js';

@Entity('grade_systems')
@Check('chk_grade_systems_grade', "\"grade\" IN ('A', 'B', 'C', 'D', 'E', 'F')")
@Check('chk_grade_systems_min_score_valid', '"min_score" BETWEEN 0 AND 100')
@Check(
  'chk_grade_systems_max_score_valid',
  '"max_score" BETWEEN "min_score" AND 100',
)
@Check('chk_grade_systems_point_valid', '"point" BETWEEN 0 AND 5')
@Unique('uq_grade_systems_grading_policy_id_grade', [
  'gradingPolicyId',
  'grade',
])
export class GradeSystem extends MutableRecord {
  /** Identifies the scale version that owns the score band. */
  @Column({ name: 'grading_policy_id', type: 'uuid', update: false })
  gradingPolicyId!: string;

  @ManyToOne('GradingPolicy', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'grading_policy_id',
    foreignKeyConstraintName: 'fk_grade_systems_grading_policy_id',
  })
  gradingPolicy?: GradingPolicy;

  /** Supplies the letter awarded for scores in the band. */
  @Column({ name: 'grade', type: 'text' })
  grade!: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

  /** Sets the lowest inclusive score in the band. */
  @Column({ name: 'min_score', type: 'numeric', precision: 5, scale: 2 })
  minScore!: string;

  /** Sets the highest inclusive score in the band. */
  @Column({ name: 'max_score', type: 'numeric', precision: 5, scale: 2 })
  maxScore!: string;

  /** Supplies grade points per credit unit. */
  @Column({ name: 'point', type: 'numeric', precision: 5, scale: 2 })
  point!: string;
}
