import { SetMetadata } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';
import type { Request } from 'express';
import { validate as isUuid } from 'uuid';
import type { AccountRequest } from '../auth/account-context.js';

export const ADMIN_AUDIT_ACTIONS = {
  'user.create_student': { category: 'users', targetType: 'user' },
  'user.update': { category: 'users', targetType: 'user' },
  'user.update_placement': { category: 'academic', targetType: 'user' },
  'user.set_status': { category: 'users', targetType: 'user' },
  'user.revoke_sessions': { category: 'access', targetType: 'user' },
  'user.delete': { category: 'users', targetType: 'user' },
  'user.change_password': { category: 'access', targetType: 'user' },
  'admin.create': { category: 'access', targetType: 'admin' },
  'admin.role.assign': { category: 'access', targetType: 'admin_role' },
  'admin.role.revoke': { category: 'access', targetType: 'admin_role' },
  'role.create': { category: 'access', targetType: 'role' },
  'role.update': { category: 'access', targetType: 'role' },
  'role.delete': { category: 'access', targetType: 'role' },
} as const;

export type AuditAction = keyof typeof ADMIN_AUDIT_ACTIONS;
export type AuditOutcome = 'succeeded' | 'failed' | 'denied';
export const AUDIT_ACTION = Symbol('AUDIT_ACTION');
export const AuditAdminMutation = (action: AuditAction) =>
  SetMetadata(AUDIT_ACTION, action);

export interface AuditAttempt {
  action: AuditAction;
  outcome: AuditOutcome;
  actorUserId: string;
  targetId?: string;
  reason?: 'insufficient_privilege' | 'request_failed';
  status?: 'active' | 'suspended';
}

export class RecordAdminAuditCommand extends Command<void> {
  constructor(readonly attempt: AuditAttempt) {
    super();
  }
}

export function auditAttempt(
  request: AccountRequest,
  action: AuditAction,
  outcome: AuditOutcome,
  response?: unknown,
): AuditAttempt | undefined {
  if (request.account?.role !== 'admin') return undefined;
  const data =
    response && typeof response === 'object'
      ? (response as { id?: unknown; status?: unknown })
      : undefined;
  const candidates = [
    request.params.grantId,
    request.params.userId,
    request.params.roleId,
    data?.id,
    action.startsWith('user.') &&
    !request.params.userId &&
    action !== 'user.create_student'
      ? request.account.userId
      : undefined,
  ];
  const targetId = candidates.find(
    (value): value is string => typeof value === 'string' && isUuid(value),
  );
  const status =
    action === 'user.set_status' &&
    (data?.status === 'active' || data?.status === 'suspended')
      ? data.status
      : undefined;
  return {
    action,
    outcome,
    actorUserId: request.account.userId,
    targetId,
    status,
    reason:
      outcome === 'denied'
        ? 'insufficient_privilege'
        : outcome === 'failed'
          ? 'request_failed'
          : undefined,
  };
}

export type AdminAuditRequest = Request & AccountRequest;
