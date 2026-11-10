import { ApplicationError } from '#core/http/application-error.js';
import { Inject, Injectable, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { requestContext } from '#core/logging/request-context.js';
import {
  LOG_PROVIDER,
  LogService,
} from '#core/logging/services/log.service.js';
import { ADMIN_AUDIT_ACTIONS } from '#shared/admin-authorization/audit.contracts.js';
import type { AuditAttempt } from '#shared/admin-authorization/audit.contracts.js';
import { AdminAuthorizationService } from '#shared/admin-authorization/admin-authorization.service.js';
import { Admin } from '../entity/admins.entity.js';
import type { ListAuditEventsDto } from '../dtos/admin-audit.dto.js';
import type { IAdminAuditRepository } from '../repositories/admin-audit.repository.js';
import { ADMIN_AUDIT_REPOSITORY } from '../util/constants.js';

@Injectable()
export class AdminAuditService {
  constructor(
    private readonly database: DataSource,
    private readonly authorization: AdminAuthorizationService,
    @Inject(ADMIN_AUDIT_REPOSITORY)
    private readonly repository: IAdminAuditRepository,
    @Inject(LOG_PROVIDER) private readonly log: LogService,
  ) {
    log.setContext(AdminAuditService.name);
  }

  async record(attempt: AuditAttempt): Promise<void> {
    try {
      const definition = ADMIN_AUDIT_ACTIONS[attempt.action];
      const admin = await this.database.getRepository(Admin).findOne({
        where: { userId: attempt.actorUserId },
        select: { id: true },
      });
      // Construct a safe event rather than copying request fields into immutable history.
      await this.repository.append({
        action: attempt.action,
        category: definition.category,
        targetType: definition.targetType,
        actorUserId: attempt.actorUserId,
        actorAdminId: admin?.id,
        targetId: attempt.targetId,
        reason: attempt.reason,
        outcome: attempt.outcome,
        changes: attempt.status
          ? { status: attempt.status }
          : attempt.lecturerId !== undefined
            ? { lecturerId: attempt.lecturerId }
            : undefined,
        ...requestContext.getStore(),
      });
    } catch (error: unknown) {
      // The HTTP mutation may already have committed, so preserve its actual outcome.
      this.log.error('Administrator audit write failed', {
        action: attempt.action,
        outcome: attempt.outcome,
        errorType: error instanceof Error ? error.name : 'UnknownError',
      });
    }
  }

  async list(userId: string, input: ListAuditEventsDto) {
    await this.authorization.require(userId, 'read_audit');
    return this.repository.list(input);
  }

  async get(userId: string, id: string) {
    await this.authorization.require(userId, 'read_audit');
    const event = await this.repository.find(id);
    if (!event)
      throw new ApplicationError(
        HttpStatus.NOT_FOUND,
        'Audit event was not found',
      );
    return event;
  }
}
