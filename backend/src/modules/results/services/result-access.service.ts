import { HttpStatus, Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { ApplicationError } from '#core/http/application-error.js';
import { AdminAuthorizationService } from '#shared/admin-authorization/admin-authorization.service.js';
import {
  hasGlobalSuperAdmin,
  hasPrivilege,
} from '#shared/admin-authorization/privilege.js';
import type { AdminAccess } from '#shared/admin-authorization/privilege.js';
import type { ResultGroupDetailDto } from '../dtos/result-review.dto.js';
import { ResultGroup } from '../entity/result-groups.entity.js';

type ReviewPrivilege = 'approve_result' | 'review_result' | 'reopen_result';
type ResultScope = 'teaching' | 'grading' | 'department' | ReviewPrivilege;

export interface ResultContext {
  actor: AdminAccess;
  group: ResultGroup;
  offering: {
    id: string;
    departmentId: string;
    lecturerId: string | null;
    gradingPolicyId: string;
  };
}

@Injectable()
export class ResultAccessService {
  constructor(private readonly authorization: AdminAuthorizationService) {}

  async department(
    actorId: string,
    departmentId: string,
    manager: EntityManager,
  ): Promise<void> {
    const access = await this.authorization.resolve(actorId, manager);
    this.requireDepartmentReview(access, departmentId);
  }

  async load(
    actorId: string,
    groupId: string,
    scope: ResultScope,
    manager: EntityManager,
    lock = false,
  ): Promise<ResultContext> {
    // Registration, reassignment and result changes all lock the offering before its group.
    const [offering] = await manager.query<ResultContext['offering'][]>(
      'SELECT o.id, o.department_id AS "departmentId", o.lecturer_id AS "lecturerId", o.grading_policy_id AS "gradingPolicyId" ' +
        'FROM course_offerings o JOIN result_groups g ON g.course_offering_id = o.id WHERE g.id = $1' +
        (lock ? ' FOR UPDATE OF o' : ''),
      [groupId],
    );
    const group =
      offering &&
      (await manager.getRepository(ResultGroup).findOne({
        where: { id: groupId },
        lock: lock ? { mode: 'pessimistic_write' } : undefined,
      }));
    if (!offering || !group)
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        'The result group could not be found.',
      );

    // Use the same connection for the group and its grants, including for read snapshots.
    const departmentId = offering.departmentId;
    let actor: AdminAccess;
    if (scope === 'teaching' || scope === 'grading') {
      actor = await this.authorization.require(
        actorId,
        'teach_course',
        departmentId,
        manager,
      );
      if (
        offering.lecturerId !== actor.adminId ||
        group.lecturerId !== actor.adminId
      )
        throw new ApplicationError(
          HttpStatus.FORBIDDEN,
          'Only the assigned lecturer can access this teaching roster.',
        );
      if (
        scope === 'grading' &&
        !hasPrivilege(actor, 'grade_result', departmentId)
      )
        throw new ApplicationError(
          HttpStatus.FORBIDDEN,
          'You do not have permission to grade results in this department.',
        );
    } else if (scope === 'department') {
      actor = await this.authorization.resolve(actorId, manager);
      this.requireDepartmentReview(actor, departmentId);
      if (!group.submittedAt)
        throw new ApplicationError(
          HttpStatus.NOT_FOUND,
          'The result group has not been submitted for departmental review.',
        );
    } else {
      actor = await this.authorization.require(
        actorId,
        scope,
        departmentId,
        manager,
      );
    }
    return { actor, group, offering };
  }

  async approvalEligibility(
    context: ResultContext,
    manager: EntityManager,
  ): Promise<Pick<ResultGroupDetailDto, 'canApprove' | 'approvalBlockedReason'>> {
    const blocked = (approvalBlockedReason: string) => ({
      canApprove: false,
      approvalBlockedReason,
    });
    const { actor, group, offering } = context;
    if (!hasPrivilege(actor, 'approve_result', offering.departmentId))
      return blocked(
        'You do not have permission to approve results in this department.',
      );
    if (group.status !== 'submitted')
      return blocked('Only submitted results can be approved.');
    if (hasGlobalSuperAdmin(actor))
      return { canApprove: true, approvalBlockedReason: null };

    const ownResults =
      'You cannot approve results you taught, submitted, or entered marks for. Ask another authorized reviewer or a Super Admin to approve them.';
    if (
      offering.lecturerId === actor.adminId ||
      group.lecturerId === actor.adminId ||
      group.submittedByAdminId === actor.adminId
    )
      return blocked(ownResults);

    // Reassignment must not let a former marks author approve their own work.
    // Marks history commits with changed scores and is append-only; failed/no-op saves do not count.
    const [history] = await manager.query<{ contributed: boolean }[]>(
      `SELECT EXISTS (
        SELECT 1 FROM admin_audit_events event
        WHERE event.actor_admin_id = $1 AND event.action = 'result.marks.save'
          AND event.outcome = 'succeeded' AND event.metadata->>'resultGroupId' = $2
          AND (
            event.changes #> '{before,caScore}' IS DISTINCT FROM event.changes #> '{after,caScore}'
            OR event.changes #> '{before,examScore}' IS DISTINCT FROM event.changes #> '{after,examScore}'
          )
      ) AS contributed`,
      [actor.adminId, group.id],
    );
    return history?.contributed
      ? blocked(ownResults)
      : { canApprove: true, approvalBlockedReason: null };
  }

  async requireApproval(
    context: ResultContext,
    manager: EntityManager,
  ): Promise<void> {
    const eligibility = await this.approvalEligibility(context, manager);
    if (!eligibility.canApprove)
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        eligibility.approvalBlockedReason!,
      );
  }

  private requireDepartmentReview(
    access: AdminAccess,
    departmentId: string,
  ): void {
    if (
      !hasPrivilege(access, 'review_result', departmentId) &&
      !hasPrivilege(access, 'approve_result', departmentId) &&
      !hasPrivilege(access, 'reopen_result', departmentId)
    ) {
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        'You do not have permission to review results in this department.',
      );
    }
  }
}
