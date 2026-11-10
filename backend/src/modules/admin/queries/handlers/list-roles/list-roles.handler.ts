import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ListRolesQuery } from '../../impl.js';
import { AdminManagementService } from '../../../services/admin-management.service.js';

@QueryHandler(ListRolesQuery)
export class ListRolesHandler implements IQueryHandler<ListRolesQuery> {
  constructor(private readonly service: AdminManagementService) {}

  execute(message: ListRolesQuery) {
    return this.service.listRoles(message.actorUserId, message.input);
  }
}
