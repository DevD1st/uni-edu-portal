import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { GetUserProfileQuery } from '../../impl.js';
import { UserAdministrationService } from '../../../services/user-administration.service.js';

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler
  implements IQueryHandler<GetUserProfileQuery>
{
  constructor(private readonly service: UserAdministrationService) {}

  execute(query: GetUserProfileQuery) {
    return this.service.get(query.userId, query.actorUserId, query.populate);
  }
}
