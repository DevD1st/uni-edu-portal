import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { GetAuditEventQuery } from '../../impl.js';
import { AdminAuditService } from '../../../services/admin-audit.service.js';

@QueryHandler(GetAuditEventQuery)
export class GetAuditEventHandler implements IQueryHandler<GetAuditEventQuery> {
  constructor(private readonly service: AdminAuditService) {}

  execute(message: GetAuditEventQuery) {
    return this.service.get(message.actorUserId, message.eventId);
  }
}
