import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AdminManagementService } from './services/admin-management.service.js';
import { AdminAuditService } from './services/admin-audit.service.js';
import { AdminAuthorizationRepository } from './repositories/admin-authorization.repository.js';
import { AdminAuditRepository } from './repositories/admin-audit.repository.js';
import {
  ADMIN_AUTHORIZATION_REPOSITORY,
  ADMIN_AUDIT_REPOSITORY,
} from './util/constants.js';
import { AdminAuditInterceptor } from './interceptors/admin-audit.interceptor.js';
import { GetAdminAuthorizationHandler } from './queries/handlers/get-admin-authorization/get-admin-authorization.handler.js';
import { AdminsController } from './controllers/admins.controller.js';
import { RolesController } from './controllers/roles.controller.js';
import { AdminAuditController } from './controllers/admin-audit.controller.js';
import { CreateAdminHandler } from './commands/handlers/create-admin/create-admin.handler.js';
import { SaveRoleHandler } from './commands/handlers/save-role/save-role.handler.js';
import { DeleteRoleHandler } from './commands/handlers/delete-role/delete-role.handler.js';
import { AssignAdminRoleHandler } from './commands/handlers/assign-admin-role/assign-admin-role.handler.js';
import { RevokeAdminRoleHandler } from './commands/handlers/revoke-admin-role/revoke-admin-role.handler.js';
import { RecordAdminAuditHandler } from './commands/handlers/record-admin-audit/record-admin-audit.handler.js';
import { ListAdminsHandler } from './queries/handlers/list-admins/list-admins.handler.js';
import { GetAdminHandler } from './queries/handlers/get-admin/get-admin.handler.js';
import { ListRolesHandler } from './queries/handlers/list-roles/list-roles.handler.js';
import { ListAuditEventsHandler } from './queries/handlers/list-audit-events/list-audit-events.handler.js';
import { GetAuditEventHandler } from './queries/handlers/get-audit-event/get-audit-event.handler.js';

@Module({
  controllers: [AdminsController, RolesController, AdminAuditController],
  providers: [
    AdminManagementService,
    AdminAuditService,
    GetAdminAuthorizationHandler,
    {
      provide: ADMIN_AUTHORIZATION_REPOSITORY,
      useClass: AdminAuthorizationRepository,
    },
    { provide: ADMIN_AUDIT_REPOSITORY, useClass: AdminAuditRepository },
    { provide: APP_INTERCEPTOR, useClass: AdminAuditInterceptor },
    CreateAdminHandler,
    SaveRoleHandler,
    DeleteRoleHandler,
    AssignAdminRoleHandler,
    RevokeAdminRoleHandler,
    RecordAdminAuditHandler,
    ListAdminsHandler,
    GetAdminHandler,
    ListRolesHandler,
    ListAuditEventsHandler,
    GetAuditEventHandler,
  ],
})
export class AdminModule {}
