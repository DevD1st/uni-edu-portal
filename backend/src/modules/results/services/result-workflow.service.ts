import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { DataSource, In, IsNull, Not } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { writeTransaction } from '#core/database/database-write.js';
import { ApplicationError } from '#core/http/application-error.js';
import {
  LOG_PROVIDER,
  LogService,
} from '#core/logging/services/log.service.js';
import { RecordTransactionalAdminAuditCommand } from '#shared/admin-authorization/audit.contracts.js';
import type {
  AuditMarks,
  TransactionalAuditEvent,
} from '#shared/admin-authorization/audit.contracts.js';
import type { GradingPolicy } from '#modules/grading/entity/grading-policies.entity.js';
import type { GradeSystem } from '#modules/grading/entity/grade-systems.entity.js';
import type { StudentRegisteredCourse } from '#modules/registration/entity/student-registered-courses.entity.js';
import type {
  ResultStateResponseDto,
  SaveMarksResponseDto,
} from '../dtos/result-review.dto.js';
import type {
  ReopenResultDto,
  RequestResultCorrectionsDto,
  ResultDecisionNoteDto,
  SaveResultMarksDto,
} from '../dtos/result-write.dto.js';
import { ResultGroup } from '../entity/result-groups.entity.js';
import { ResultAccessService } from './result-access.service.js';
import type { ResultContext } from './result-access.service.js';

@Injectable()
export class ResultWorkflowService {
  constructor(
    private readonly database: DataSource,
    private readonly access: ResultAccessService,
    private readonly commands: CommandBus,
    @Inject(LOG_PROVIDER) private readonly log: LogService,
  ) {
    log.setContext(ResultWorkflowService.name);
  }

  async saveMarks(
    actorId: string,
    id: string,
    input: SaveResultMarksDto,
  ): Promise<SaveMarksResponseDto> {
    const result = await writeTransaction(this.database, async (manager) => {
      const context = await this.access.load(
        actorId,
        id,
        'grading',
        manager,
        true,
      );
      requireEditable(context.group);
      const requested = new Map(
        input.marks.map((mark) => [mark.enrollmentId, mark]),
      );
      if (requested.size !== input.marks.length)
        throw new ApplicationError(
          HttpStatus.BAD_REQUEST,
          'Each enrollment can appear only once in a marks update.',
        );

      const repository = manager.getRepository<StudentRegisteredCourse>(
        'StudentRegisteredCourse',
      );
      const rows = await repository.find({
        where: { id: In([...requested.keys()]), resultGroupId: id },
        order: { id: 'ASC' },
      });
      if (rows.length !== requested.size)
        throw new ApplicationError(
          HttpStatus.BAD_REQUEST,
          'One or more enrollments do not belong to this result group.',
        );
      const policy = await manager
        .getRepository<GradingPolicy>('GradingPolicy')
        .findOneByOrFail({ id: context.offering.gradingPolicyId });

      const changed: StudentRegisteredCourse[] = [];
      const events: TransactionalAuditEvent[] = [];
      for (const row of rows) {
        const mark = requested.get(row.id)!;
        if (mark.caScore === undefined && mark.examScore === undefined)
          throw new ApplicationError(
            HttpStatus.BAD_REQUEST,
            'Enter a CA or exam mark for each enrollment in the update.',
          );
        const before = marksSnapshot(row);
        row.caScore = score(mark.caScore, row.caScore, policy.maxCaScore, 'CA');
        row.examScore = score(
          mark.examScore,
          row.examScore,
          policy.maxExamScore,
          'exam',
        );
        const after = marksSnapshot(row);
        if (
          before.caScore === after.caScore &&
          before.examScore === after.examScore
        )
          continue;
        changed.push(row);
        events.push({
          action: 'result.marks.save',
          targetId: row.id,
          metadata: metadata(context),
          changes: { before, after },
        });
      }
      if (changed.length) {
        await repository.save(changed, { reload: false });
        await this.audit(manager, actorId, context, events);
      }
      return { id, changedCount: changed.length };
    });
    this.log.log('Result marks saved', {
      actorUserId: actorId,
      resultGroupId: id,
      changedCount: result.changedCount,
    });
    return result;
  }

  submit(
    actorId: string,
    id: string,
    input: ResultDecisionNoteDto,
  ): Promise<ResultStateResponseDto> {
    return this.transition(actorId, id, 'grading', async (manager, context) => {
      const { group, actor } = context;
      requireEditable(group);
      if (group.registrationStatus !== 'closed')
        throw new ApplicationError(
          HttpStatus.CONFLICT,
          'Close registration before submitting results.',
        );
      await completeRows(manager, group.id);
      const before = group.status;
      group.status = 'submitted';
      group.submittedAt = new Date();
      group.submittedByAdminId = actor.adminId;
      group.submissionReason = input.note ?? null;
      return [stateEvent(context, 'result.submit', before)];
    });
  }

  approve(
    actorId: string,
    id: string,
    input: ResultDecisionNoteDto,
  ): Promise<ResultStateResponseDto> {
    return this.transition(
      actorId,
      id,
      'approve_result',
      async (manager, context) => {
        const { group, actor, offering } = context;
        requireSubmitted(group);
        await this.access.requireApproval(context, manager);
        const rows = await completeRows(manager, group.id);
        const bands = await manager
          .getRepository<GradeSystem>('GradeSystem')
          .findBy({
            gradingPolicyId: offering.gradingPolicyId,
          });
        const events: TransactionalAuditEvent[] = [];
        for (const row of rows) {
          // Compare integer hundredths to keep inclusive grade boundaries exact.
          const total = cents(row.caScore) + cents(row.examScore);
          const band = bands.find(
            (entry) =>
              total >= cents(entry.minScore) && total <= cents(entry.maxScore),
          );
          if (!band)
            throw new ApplicationError(
              HttpStatus.CONFLICT,
              'A mark total is outside the configured grade bands. Review the grading policy.',
            );
          const before = marksSnapshot(row);
          row.awardedGradeSystemId = band.id;
          events.push({
            action: 'result.grade.award',
            targetId: row.id,
            metadata: metadata(context),
            changes: { before, after: marksSnapshot(row) },
          });
        }
        // The database only allows awards while the group is submitted. Publish after saving them.
        await manager
          .getRepository<StudentRegisteredCourse>('StudentRegisteredCourse')
          .save(rows, { reload: false, chunk: 200 });
        group.status = 'approved';
        group.approvedAt = new Date();
        group.approvedByAdminId = actor.adminId;
        group.approvalReason = input.note ?? null;
        events.push(stateEvent(context, 'result.approve', 'submitted'));
        return events;
      },
    );
  }

  requestCorrections(
    actorId: string,
    id: string,
    input: RequestResultCorrectionsDto,
  ): Promise<ResultStateResponseDto> {
    return this.transition(
      actorId,
      id,
      'review_result',
      async (_manager, context) => {
        const { group, actor } = context;
        requireSubmitted(group);
        group.status = 'correction_requested';
        group.correctionRequestedAt = new Date();
        group.correctionRequestedByAdminId = actor.adminId;
        group.correctionRequestReason = input.reason;
        return [stateEvent(context, 'result.request_corrections', 'submitted')];
      },
    );
  }

  reopen(
    actorId: string,
    id: string,
    input: ReopenResultDto,
  ): Promise<ResultStateResponseDto> {
    return this.transition(
      actorId,
      id,
      'reopen_result',
      async (_manager, context) => {
        const { group } = context;
        if (group.status !== 'submitted' && group.status !== 'approved')
          throw new ApplicationError(
            HttpStatus.CONFLICT,
            'Only submitted or approved results can be reopened.',
          );
        const before = group.status;
        group.status = 'pending';
        return [
          {
            action: 'result.reopen',
            targetId: group.id,
            metadata: metadata(context),
            changes: { before, after: 'pending' },
            reason: input.reason,
          },
        ];
      },
      true,
    );
  }

  private async transition(
    actorId: string,
    id: string,
    scope: 'grading' | 'approve_result' | 'review_result' | 'reopen_result',
    apply: (
      manager: EntityManager,
      context: ResultContext,
    ) => Promise<TransactionalAuditEvent[]>,
    clearAwards = false,
  ): Promise<ResultStateResponseDto> {
    const result = await writeTransaction(this.database, async (manager) => {
      const context = await this.access.load(actorId, id, scope, manager, true);
      const events = await apply(manager, context);
      await manager.getRepository(ResultGroup).save(context.group);
      if (clearAwards) {
        // The database allows clearing awards once pending. The status, awards and history commit together.
        const repository = manager.getRepository<StudentRegisteredCourse>(
          'StudentRegisteredCourse',
        );
        const rows = await repository.find({
          where: { resultGroupId: id, awardedGradeSystemId: Not(IsNull()) },
          order: { id: 'ASC' },
        });
        for (const row of rows) {
          const before = marksSnapshot(row);
          row.awardedGradeSystemId = null;
          events.push({
            action: 'result.grade.clear',
            targetId: row.id,
            metadata: metadata(context),
            changes: { before, after: marksSnapshot(row) },
          });
        }
        if (rows.length)
          await repository.save(rows, { reload: false, chunk: 200 });
      }
      await this.audit(manager, actorId, context, events);
      return {
        ...context.group,
        offeringId: context.offering.id,
        departmentId: context.offering.departmentId,
      };
    });
    this.log.log('Result state changed', {
      actorUserId: actorId,
      resultGroupId: id,
      status: result.status,
    });
    return result;
  }

  private audit(
    manager: EntityManager,
    actorId: string,
    context: ResultContext,
    events: TransactionalAuditEvent[],
  ): Promise<void> {
    return this.commands.execute(
      new RecordTransactionalAdminAuditCommand(
        manager,
        actorId,
        context.actor.adminId,
        events,
      ),
    );
  }
}

function requireEditable(group: ResultGroup): void {
  if (group.status !== 'pending' && group.status !== 'correction_requested')
    throw new ApplicationError(
      HttpStatus.CONFLICT,
      'Marks can be edited only in a draft or after corrections have been requested.',
    );
}

function requireSubmitted(group: ResultGroup): void {
  if (group.status !== 'submitted')
    throw new ApplicationError(
      HttpStatus.CONFLICT,
      'Only results submitted for review can receive this decision.',
    );
}

async function completeRows(manager: EntityManager, resultGroupId: string) {
  const rows = await manager
    .getRepository<StudentRegisteredCourse>('StudentRegisteredCourse')
    .find({ where: { resultGroupId }, order: { id: 'ASC' } });
  if (!rows.length || !rows.every(hasBothMarks))
    throw new ApplicationError(
      HttpStatus.CONFLICT,
      'Enter both CA and exam marks for every enrollment before continuing.',
    );
  return rows;
}

function hasBothMarks(
  row: StudentRegisteredCourse,
): row is StudentRegisteredCourse & { caScore: string; examScore: string } {
  return row.caScore !== null && row.examScore !== null;
}

function score(
  value: number | null | undefined,
  previous: string | null,
  max: string,
  component: string,
): string | null {
  if (value === undefined) return previous;
  if (value === null) return null;
  const fixed = value.toFixed(2);
  if (Number(fixed) !== value)
    throw new ApplicationError(
      HttpStatus.BAD_REQUEST,
      'Enter a ' + component + ' mark with up to two decimal places.',
    );
  if (value < 0 || value > Number(max))
    throw new ApplicationError(
      HttpStatus.BAD_REQUEST,
      'Enter a ' +
        component +
        ' mark from 0 to ' +
        Number(max) +
        ' for this offering.',
    );
  return fixed;
}

function cents(value: string): number {
  return Math.round(Number(value) * 100);
}

function marksSnapshot(row: StudentRegisteredCourse): AuditMarks {
  return {
    caScore: row.caScore === null ? null : Number(row.caScore),
    examScore: row.examScore === null ? null : Number(row.examScore),
    awardedGradeSystemId: row.awardedGradeSystemId,
  };
}

function metadata({ group, offering }: ResultContext) {
  return {
    offeringId: offering.id,
    departmentId: offering.departmentId,
    resultGroupId: group.id,
  };
}

function stateEvent(
  context: ResultContext,
  action: 'result.submit' | 'result.approve' | 'result.request_corrections',
  before: ResultGroup['status'],
): TransactionalAuditEvent {
  return {
    action,
    targetId: context.group.id,
    metadata: metadata(context),
    changes: { before, after: context.group.status },
  };
}
