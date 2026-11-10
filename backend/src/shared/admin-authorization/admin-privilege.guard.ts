import { ApplicationError } from '#core/http/application-error.js';
import {
  HttpException,
  Injectable,
  SetMetadata,
  HttpStatus,
} from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CommandBus } from '@nestjs/cqrs';
import { AdminAuthorizationService } from './admin-authorization.service.js';
import type { Privilege } from './privilege.js';
import type { AccountRequest } from '../auth/account-context.js';
import {
  AUDIT_ACTION,
  RecordAdminAuditCommand,
  auditAttempt,
} from './audit.contracts.js';
import type { AuditAction } from './audit.contracts.js';

const REQUIRED_PRIVILEGE = Symbol('REQUIRED_PRIVILEGE');
export const RequireAdminPrivilege = (privilege: Privilege) =>
  SetMetadata(REQUIRED_PRIVILEGE, privilege);

@Injectable()
export class AdminPrivilegeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AdminAuthorizationService,
    private readonly commands: CommandBus,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AccountRequest>();
    const account = request.account;
    if (account?.role !== 'admin')
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        'Administrator access is required',
      );
    const privilege = this.reflector.getAllAndOverride<Privilege | undefined>(
      REQUIRED_PRIVILEGE,
      [context.getHandler(), context.getClass()],
    );
    try {
      if (privilege) await this.auth.requireAnyScope(account.userId, privilege);
      else await this.auth.resolve(account.userId);
    } catch (error: unknown) {
      const action = this.reflector.get<AuditAction | undefined>(
        AUDIT_ACTION,
        context.getHandler(),
      );
      if (
        action &&
        error instanceof HttpException &&
        error.getStatus() === HttpStatus.FORBIDDEN
      ) {
        const attempt = auditAttempt(request, action, 'denied');
        if (attempt)
          await this.commands.execute(new RecordAdminAuditCommand(attempt));
      }
      throw error;
    }
    return true;
  }
}
