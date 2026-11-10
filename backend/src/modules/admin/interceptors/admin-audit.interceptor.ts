import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, of } from 'rxjs';
import {
  AUDIT_ACTION,
  RecordAdminAuditCommand,
  auditAttempt,
} from '#shared/admin-authorization/audit.contracts.js';
import type { AuditAction } from '#shared/admin-authorization/audit.contracts.js';
import type { AccountRequest } from '#shared/auth/account-context.js';

@Injectable()
export class AdminAuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly commands: CommandBus,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const action = this.reflector.get<AuditAction | undefined>(
      AUDIT_ACTION,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest<AccountRequest>();
    if (!action || request.account?.role !== 'admin') return next.handle();

    let result: unknown;
    try {
      result = await lastValueFrom(next.handle());
    } catch (error: unknown) {
      const attempt = auditAttempt(
        request,
        action,
        error instanceof HttpException &&
          error.getStatus() === HttpStatus.FORBIDDEN
          ? 'denied'
          : 'failed',
      );
      if (attempt)
        await this.commands.execute(new RecordAdminAuditCommand(attempt));
      throw error;
    }
    const attempt = auditAttempt(request, action, 'succeeded', result);
    if (attempt)
      await this.commands.execute(new RecordAdminAuditCommand(attempt));
    return of(result);
  }
}
