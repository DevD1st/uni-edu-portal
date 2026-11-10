import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';
import type { CourseOffering } from '#modules/course/entity/course-offerings.entity.js';
import type { Admin } from '#modules/admin/entity/admins.entity.js';

@Entity('result_groups')
@Check(
  'chk_result_groups_status',
  "\"status\" IN ('pending', 'submitted', 'approved', 'correction_requested')",
)
@Check(
  'chk_result_groups_registration_status',
  "\"registration_status\" IN ('opened', 'closed')",
)
@Index('idx_result_groups_lecturer_id_status', ['lecturerId', 'status'])
@Check(
  'chk_result_groups_closure',
  '("registration_status" = \'opened\' AND "status" = \'pending\' AND "registration_closed_at" IS NULL AND "registration_closed_by_admin_id" IS NULL) OR ("registration_status" = \'closed\' AND "registration_closed_at" IS NOT NULL AND "registration_closed_by_admin_id" IS NOT NULL)',
)
@Check(
  'chk_result_groups_submission',
  '"status" = \'pending\' OR ("submitted_at" IS NOT NULL AND "submitted_by_admin_id" IS NOT NULL)',
)
@Check(
  'chk_result_groups_approval',
  '"status" <> \'approved\' OR ("approved_at" IS NOT NULL AND "approved_by_admin_id" IS NOT NULL)',
)
@Check(
  'chk_result_groups_correction',
  '"status" <> \'correction_requested\' OR ("correction_requested_at" IS NOT NULL AND "correction_requested_by_admin_id" IS NOT NULL AND nullif(btrim("correction_request_reason"), \'\') IS NOT NULL)',
)
export class ResultGroup extends MutableRecord {
  /** Links one departmental offering to its grading roster. */
  @Column({ name: 'course_offering_id', type: 'uuid', update: false })
  courseOfferingId!: string;

  @OneToOne('CourseOffering', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'course_offering_id',
    foreignKeyConstraintName: 'fk_result_groups_course_offering_id',
  })
  courseOffering?: CourseOffering;

  /** Identifies the lecturer responsible for this result group. */
  @Column({ name: 'lecturer_id', type: 'uuid' })
  lecturerId!: string;

  @ManyToOne('Admin', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'lecturer_id',
    foreignKeyConstraintName: 'fk_result_groups_lecturer_id',
  })
  lecturer?: Admin;

  /** Tracks whether grades are pending, submitted, approved, or returned for correction. */
  @Column({ name: 'status', type: 'text', default: 'pending' })
  status!: 'pending' | 'submitted' | 'approved' | 'correction_requested';

  /** Controls enrollment until the roster is closed permanently. */
  @Column({ name: 'registration_status', type: 'text', default: 'opened' })
  registrationStatus!: 'opened' | 'closed';

  /** Records when enrollment ended. */
  @Column({
    name: 'registration_closed_at',
    type: 'timestamptz',
    nullable: true,
  })
  registrationClosedAt!: Date | null;

  /** Records who closed the roster. */
  @Column({
    name: 'registration_closed_by_admin_id',
    type: 'uuid',
    nullable: true,
  })
  registrationClosedByAdminId!: string | null;

  @ManyToOne('Admin', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'registration_closed_by_admin_id',
    foreignKeyConstraintName:
      'fk_result_groups_registration_closed_by_admin_id',
  })
  registrationClosedByAdmin?: Admin | null;

  /** Records when the latest result submission was sent for review. */
  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt!: Date | null;

  /** Identifies the latest submitting lecturer. */
  @Column({ name: 'submitted_by_admin_id', type: 'uuid', nullable: true })
  submittedByAdminId!: string | null;

  @ManyToOne('Admin', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'submitted_by_admin_id',
    foreignKeyConstraintName: 'fk_result_groups_submitted_by_admin_id',
  })
  submittedByAdmin?: Admin | null;

  /** Holds an optional note for the latest submission. */
  @Column({ name: 'submission_reason', type: 'text', nullable: true })
  submissionReason!: string | null;

  /** Records when the latest approval occurred. */
  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt!: Date | null;

  /** Identifies the latest reviewer who approved the group. */
  @Column({ name: 'approved_by_admin_id', type: 'uuid', nullable: true })
  approvedByAdminId!: string | null;

  @ManyToOne('Admin', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'approved_by_admin_id',
    foreignKeyConstraintName: 'fk_result_groups_approved_by_admin_id',
  })
  approvedByAdmin?: Admin | null;

  /** Holds an optional note for the latest approval. */
  @Column({ name: 'approval_reason', type: 'text', nullable: true })
  approvalReason!: string | null;

  /** Records when the last correction was requested. */
  @Column({
    name: 'correction_requested_at',
    type: 'timestamptz',
    nullable: true,
  })
  correctionRequestedAt!: Date | null;

  /** Identifies the reviewer who requested corrections. */
  @Column({
    name: 'correction_requested_by_admin_id',
    type: 'uuid',
    nullable: true,
  })
  correctionRequestedByAdminId!: string | null;

  @ManyToOne('Admin', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'correction_requested_by_admin_id',
    foreignKeyConstraintName:
      'fk_result_groups_correction_requested_by_admin_id',
  })
  correctionRequestedByAdmin?: Admin | null;

  /** Supplies feedback for the lecturer’s correction. */
  @Column({ name: 'correction_request_reason', type: 'text', nullable: true })
  correctionRequestReason!: string | null;
}
