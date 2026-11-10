import { Check, Column, Entity, Index } from 'typeorm';
import { IdentifiedRecord } from '#core/database/base.entity.js';

@Entity('admin_audit_events')
@Check(
  'chk_admin_audit_events_category',
  "\"category\" IN ('access', 'users', 'academic', 'results', 'operations')",
)
@Check(
  'chk_admin_audit_events_outcome',
  "\"outcome\" IN ('succeeded', 'denied', 'failed')",
)
@Index('idx_admin_audit_events_occurred_at_id', ['occurredAt', 'id'])
@Index('idx_admin_audit_events_actor_user_id_occurred_at', [
  'actorUserId',
  'occurredAt',
])
@Index('idx_admin_audit_events_actor_admin_id_occurred_at', [
  'actorAdminId',
  'occurredAt',
])
@Index('idx_admin_audit_events_target_type_target_id_occurred_at', [
  'targetType',
  'targetId',
  'occurredAt',
])
@Index('idx_admin_audit_events_action_occurred_at', ['action', 'occurredAt'])
@Index('idx_admin_audit_events_category_occurred_at', [
  'category',
  'occurredAt',
])
@Index('idx_admin_audit_events_outcome_occurred_at', ['outcome', 'occurredAt'])
export class AdminAuditEvent extends IdentifiedRecord {
  /** Records the stable action name from the administrator audit registry. */
  @Column({ name: 'action', type: 'text' })
  action!: string;

  /** Groups events for authorized audit searches. */
  @Column({ name: 'category', type: 'text' })
  category!: 'access' | 'users' | 'academic' | 'results' | 'operations';

  /** Records the authenticated account when available. */
  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId!: string | null;

  /** Records the resolved admin profile without requiring a mutable reference. */
  @Column({ name: 'actor_admin_id', type: 'uuid', nullable: true })
  actorAdminId!: string | null;

  /** Identifies the kind of resource affected. */
  @Column({ name: 'target_type', type: 'text' })
  targetType!: string;

  /** Records the internal identifier of the affected resource. */
  @Column({ name: 'target_id', type: 'uuid', nullable: true })
  targetId!: string | null;

  /** Distinguishes successful, denied, and failed mutations. */
  @Column({ name: 'outcome', type: 'text' })
  outcome!: 'succeeded' | 'denied' | 'failed';

  /** Stores a controlled reason code without raw request or feedback text. */
  @Column({ name: 'reason', type: 'text', nullable: true })
  reason!: string | null;

  /** Contains allowlisted state changes for the audited action. */
  @Column({ name: 'changes', type: 'jsonb', nullable: true })
  changes!: Record<string, unknown> | null;

  /** Contains allowlisted internal context for the audited action. */
  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  /** Correlates the event to its HTTP request. */
  @Column({ name: 'request_id', type: 'text', nullable: true })
  requestId!: string | null;

  /** Correlates the event to its active production trace. */
  @Column({ name: 'trace_id', type: 'text', nullable: true })
  traceId!: string | null;

  /** Orders events by the time the attempt occurred. */
  @Column({ name: 'occurred_at', type: 'timestamptz', default: () => 'now()' })
  occurredAt!: Date;
}
