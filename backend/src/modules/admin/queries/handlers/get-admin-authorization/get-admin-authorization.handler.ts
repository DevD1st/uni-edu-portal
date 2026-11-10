import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { GetAdminAuthorizationQuery } from '#shared/admin-authorization/contracts.js';
import { ADMIN_AUTHORIZATION_REPOSITORY } from '../../../util/constants.js';
import type { IAdminAuthorizationRepository } from '../../../repositories/admin-authorization.repository.js';

@QueryHandler(GetAdminAuthorizationQuery)
export class GetAdminAuthorizationHandler
  implements IQueryHandler<GetAdminAuthorizationQuery>
{
  constructor(
    @Inject(ADMIN_AUTHORIZATION_REPOSITORY)
    private readonly repository: IAdminAuthorizationRepository,
  ) {}

  execute(query: GetAdminAuthorizationQuery) {
    return this.repository.findByUserId(query.userId, query.manager);
  }
}
