import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ListUsersQuery } from '../../impl.js';
import { UserAdministrationService } from '../../../services/user-administration.service.js';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(private readonly service: UserAdministrationService) {}

  execute(query: ListUsersQuery) {
    return this.service.list(query.actorUserId, query.input);
  }
}
