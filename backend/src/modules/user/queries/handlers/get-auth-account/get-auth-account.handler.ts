import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { GetAuthAccountQuery } from '#shared/auth/user.contracts.js';
import type { IUserRepository } from '../../../repositories/user.repository.js';
import { USER_REPOSITORY } from '../../../util/constants.js';

@QueryHandler(GetAuthAccountQuery)
export class GetAuthAccountHandler
  implements IQueryHandler<GetAuthAccountQuery>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly repository: IUserRepository,
  ) {}

  execute(query: GetAuthAccountQuery) {
    return this.repository.getAuthAccount(query.userId);
  }
}
