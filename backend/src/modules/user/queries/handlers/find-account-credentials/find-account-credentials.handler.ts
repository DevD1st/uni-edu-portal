import { Inject } from '@nestjs/common';
import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { FindAccountCredentialsQuery } from '#shared/auth/user.contracts.js';
import type { IUserRepository } from '../../../repositories/user.repository.js';
import { USER_REPOSITORY } from '../../../util/constants.js';

@QueryHandler(FindAccountCredentialsQuery)
export class FindAccountCredentialsHandler
  implements IQueryHandler<FindAccountCredentialsQuery>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly repository: IUserRepository,
  ) {}

  execute(query: FindAccountCredentialsQuery) {
    return this.repository.findCredentials(query.email, query.role);
  }
}
