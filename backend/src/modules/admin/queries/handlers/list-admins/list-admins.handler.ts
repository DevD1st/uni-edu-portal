import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ListAdminsQuery } from '../../impl.js';
import { AdminManagementService } from '../../../services/admin-management.service.js';

@QueryHandler(ListAdminsQuery)
export class ListAdminsHandler implements IQueryHandler<ListAdminsQuery> {
  constructor(private readonly service: AdminManagementService) {}

  execute(message: ListAdminsQuery) {
    return this.service.listAdmins(message.actorUserId, message.input);
  }
}
