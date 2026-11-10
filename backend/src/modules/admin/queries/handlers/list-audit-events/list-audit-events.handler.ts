import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ListAuditEventsQuery } from '../../impl.js';
import { AdminAuditService } from '../../../services/admin-audit.service.js';

@QueryHandler(ListAuditEventsQuery)
export class ListAuditEventsHandler
  implements IQueryHandler<ListAuditEventsQuery>
{
  constructor(private readonly service: AdminAuditService) {}

  execute(message: ListAuditEventsQuery) {
    return this.service.list(message.actorUserId, message.input);
  }
}
