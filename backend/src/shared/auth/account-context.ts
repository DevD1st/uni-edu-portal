import { createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';
import type { Request } from 'express';

export type AccountRole = 'student' | 'admin';

export interface AccountPrincipal {
  userId: string;
  role: AccountRole;
  authVersion: number;
  jti: string;
  refreshJti: string;
}

export interface AccountRequest extends Request {
  account?: AccountPrincipal;
}

export class AuthenticateAccessQuery extends Query<AccountPrincipal> {
  constructor(readonly token: string) {
    super();
  }
}

export const CurrentAccount = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AccountPrincipal =>
    context.switchToHttp().getRequest<AccountRequest>().account!,
);
