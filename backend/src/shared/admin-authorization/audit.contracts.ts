import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';
import type { Request } from 'express';
import type { EntityManager } from 'typeorm';
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
  'academic.faculty.create': { category: 'academic', targetType: 'faculty' },
  'academic.faculty.update': { category: 'academic', targetType: 'faculty' },
  'academic.faculty.current_semester': {
    category: 'academic',
    targetType: 'faculty',
  },
  'academic.department.create': {
    category: 'academic',
    targetType: 'department',
  },
  'academic.department.update': {
    category: 'academic',
    targetType: 'department',
  },
  'academic.programme.create': {
    category: 'academic',
    targetType: 'programme',
  },
  'academic.programme.update': {
    category: 'academic',
    targetType: 'programme',
  },
  'academic.session.create': {
    category: 'academic',
    targetType: 'academic_session',
  },
  'academic.session.update': {
    category: 'academic',
    targetType: 'academic_session',
  },
  'academic.semester.create': { category: 'academic', targetType: 'semester' },
  'academic.semester.update': { category: 'academic', targetType: 'semester' },
  'academic.course.create': { category: 'academic', targetType: 'course' },
  'academic.course.update': { category: 'academic', targetType: 'course' },
  'academic.curriculum.add': {
    category: 'academic',
    targetType: 'course_of_study_course',
  },
  'academic.curriculum.remove': {
    category: 'academic',
    targetType: 'course_of_study_course',
  },
  'academic.offering.create': {
    category: 'academic',
    targetType: 'course_offering',
  },
  'academic.offering.update': {
    category: 'academic',
    targetType: 'course_offering',
  },
  'registration.register_for_student': {
    category: 'academic',
    targetType: 'user',
  },
  'registration.close_roster': {
    category: 'academic',
    targetType: 'result_group',
  },
  'result.marks.save': {
    category: 'results',
    targetType: 'student_registered_course',
  },
  'result.grade.award': {
    category: 'results',
    targetType: 'student_registered_course',
  },
  'result.grade.clear': {
    category: 'results',
    targetType: 'student_registered_course',
  },
  'result.submit': { category: 'results', targetType: 'result_group' },
  'result.approve': { category: 'results', targetType: 'result_group' },
  'result.request_corrections': {
    category: 'results',
    targetType: 'result_group',
  },
  'result.reopen': { category: 'results', targetType: 'result_group' },
} as const;

export type AuditAction = keyof typeof ADMIN_AUDIT_ACTIONS;
export type AuditOutcome = 'succeeded' | 'failed' | 'denied';
export const AUDIT_ACTION = Symbol('AUDIT_ACTION');
export const TRANSACTIONAL_AUDIT_SUCCESS = Symbol(
  'TRANSACTIONAL_AUDIT_SUCCESS',
);
export const AuditAdminMutation = (action: AuditAction) =>
  SetMetadata(AUDIT_ACTION, action);

export const AuditTransactionalAdminMutation = (
  action: TransactionalAuditEvent['action'],
) =>
  applyDecorators(
    AuditAdminMutation(action),
    SetMetadata(TRANSACTIONAL_AUDIT_SUCCESS, true),
  );

export interface AuditMarks {
  caScore: number | null;
  examScore: number | null;
  awardedGradeSystemId: string | null;
}

export const RESULT_REOPEN_REASONS = [
  'mark_correction',
  'review_error',
  'administrative_request',
] as const;
export type ResultReopenReason = (typeof RESULT_REOPEN_REASONS)[number];

type AuditResultStatus =
  | 'pending'
  | 'submitted'
  | 'approved'
  | 'correction_requested';
type AuditAssignment = {
  lecturerId: string | null;
  status: 'active' | 'inactive';
};

// Domain events accept only structured identifiers, scores and state changes.
export type TransactionalAuditEvent = {
  targetId: string;
  metadata: {
    offeringId: string;
    departmentId: string;
    resultGroupId?: string;
  };
} & (
  | {
      action: 'result.marks.save' | 'result.grade.award' | 'result.grade.clear';
      changes: { before: AuditMarks; after: AuditMarks };
    }
  | {
      action: 'result.submit' | 'result.approve' | 'result.request_corrections';
      changes: { before: AuditResultStatus; after: AuditResultStatus };
    }
  | {
      action: 'result.reopen';
      changes: { before: 'submitted' | 'approved'; after: 'pending' };
      reason: ResultReopenReason;
    }
  | {
      action: 'registration.close_roster';
      changes: { before: 'opened'; after: 'closed' };
    }
  | {
      action: 'academic.offering.update';
      changes: { before: AuditAssignment; after: AuditAssignment };
    }
);

export class RecordTransactionalAdminAuditCommand extends Command<void> {
  constructor(
    readonly manager: EntityManager,
    readonly actorUserId: string,
    readonly actorAdminId: string,
    readonly events: readonly TransactionalAuditEvent[],
  ) {
    super();
  }
}

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
    action.startsWith('academic.') ||
    (action.startsWith('result.') &&
      ADMIN_AUDIT_ACTIONS[action].targetType === 'result_group')
      ? request.params.id
      : undefined,
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
