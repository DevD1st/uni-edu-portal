import { ApplicationError } from '#core/http/application-error.js';
import { Injectable, HttpStatus } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AuthenticateAccessQuery } from './account-context.js';
import type { AccountRequest } from './account-context.js';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly queries: QueryBus) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AccountRequest>();
    const token = /^Bearer ([^\s]+)$/i.exec(
      request.headers.authorization ?? '',
    )?.[1];
    if (!token)
      throw new ApplicationError(
        HttpStatus.UNAUTHORIZED,
        'Sign in to continue.',
      );
    request.account = await this.queries.execute(
      new AuthenticateAccessQuery(token),
    );
    return true;
  }
}
