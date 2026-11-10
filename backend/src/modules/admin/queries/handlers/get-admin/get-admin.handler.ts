import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { GetAdminQuery } from '../../impl.js';
import { AdminManagementService } from '../../../services/admin-management.service.js';

@QueryHandler(GetAdminQuery)
export class GetAdminHandler implements IQueryHandler<GetAdminQuery> {
  constructor(private readonly service: AdminManagementService) {}

  execute(message: GetAdminQuery) {
    return this.service.getAdmin(
      message.actorUserId,
      message.adminId,
      message.populate,
    );
  }
}
