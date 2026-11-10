import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { AuthenticateAccessQuery } from '#shared/auth/account-context.js';
import { AuthenticationService } from '../../../services/authentication.service.js';

@QueryHandler(AuthenticateAccessQuery)
export class AuthenticateAccessHandler
  implements IQueryHandler<AuthenticateAccessQuery>
{
  constructor(private readonly service: AuthenticationService) {}

  execute(message: AuthenticateAccessQuery) {
    return this.service.authenticate(message.token);
  }
}
