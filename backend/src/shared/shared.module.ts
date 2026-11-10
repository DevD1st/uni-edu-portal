import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AccessTokenGuard } from './auth/access-token.guard.js';
import { AdminPrivilegeGuard } from './admin-authorization/admin-privilege.guard.js';
import { AdminAuthorizationService } from './admin-authorization/admin-authorization.service.js';
import { HttpExceptionFilter } from './http/http-exception.filter.js';

@Global()
@Module({
  providers: [
    AccessTokenGuard,
    AdminPrivilegeGuard,
    AdminAuthorizationService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
  exports: [AccessTokenGuard, AdminPrivilegeGuard, AdminAuthorizationService],
})
export class SharedModule {}
