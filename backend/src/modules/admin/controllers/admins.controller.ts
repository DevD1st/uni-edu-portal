import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags, ApiNoContentResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from '#shared/auth/access-token.guard.js';
import { CurrentAccount } from '#shared/auth/account-context.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';
import {
  AdminPrivilegeGuard,
  RequireAdminPrivilege,
} from '#shared/admin-authorization/admin-privilege.guard.js';
import { AuditAdminMutation } from '#shared/admin-authorization/audit.contracts.js';
import { GetAdminAuthorizationQuery } from '#shared/admin-authorization/contracts.js';
import { AssignAdminRoleDto, CreateAdminDto } from '../dtos/admin-write.dto.js';
import {
  AssignAdminRoleCommand,
  CreateAdminCommand,
  RevokeAdminRoleCommand,
} from '../commands/impl.js';
import { GetAdminQuery, ListAdminsQuery } from '../queries/impl.js';
import {
  AdminAuthorizationResponseDto,
  AdminPageResponseDto,
  AdminResponseDto,
  CreatedAdminResponseDto,
  RoleAssignmentResponseDto,
} from '../dtos/admin-response.dto.js';
import {
  AdminDirectoryQueryDto,
  AdminIdParamsDto,
  RoleAssignmentParamsDto,
} from '../dtos/admin-params.dto.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';
import { ApplicationError } from '#core/http/application-error.js';

@ApiTags('Administrators')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminPrivilegeGuard)
@Controller({ path: 'admin/admins', version: '1' })
export class AdminsController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  @Get('me/authorization')
  @ApiDtoResponse(AdminAuthorizationResponseDto)
  async authorization(
    @CurrentAccount() actor: AccountPrincipal,
  ): Promise<AdminAuthorizationResponseDto> {
    const access = await this.queries.execute(
      new GetAdminAuthorizationQuery(actor.userId),
    );
    if (!access)
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        'Administrator access is required.',
      );
    return access;
  }

  @Get()
  @RequireAdminPrivilege('read_admin')
  @ApiDtoResponse(AdminPageResponseDto)
  list(
    @CurrentAccount() actor: AccountPrincipal,
    @Query() input: AdminDirectoryQueryDto,
  ): Promise<AdminPageResponseDto> {
    return this.queries.execute(new ListAdminsQuery(actor.userId, input));
  }

  @Get(':adminId')
  @RequireAdminPrivilege('read_admin')
  @ApiDtoResponse(AdminResponseDto)
  get(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { adminId }: AdminIdParamsDto,
    @Query() input: AdminDirectoryQueryDto,
  ): Promise<AdminResponseDto> {
    return this.queries.execute(
      new GetAdminQuery(actor.userId, adminId, input.populate),
    );
  }

  @Post()
  @AuditAdminMutation('admin.create')
  @RequireAdminPrivilege('create_admin')
  @ApiDtoResponse(CreatedAdminResponseDto, 201)
  create(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: CreateAdminDto,
  ): Promise<CreatedAdminResponseDto> {
    return this.commands.execute(new CreateAdminCommand(actor.userId, input));
  }

  @Post(':adminId/roles')
  @AuditAdminMutation('admin.role.assign')
  @RequireAdminPrivilege('manage_admin_roles')
  @ApiDtoResponse(RoleAssignmentResponseDto, 201)
  assign(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { adminId }: AdminIdParamsDto,
    @Body() input: AssignAdminRoleDto,
  ): Promise<RoleAssignmentResponseDto> {
    return this.commands.execute(
      new AssignAdminRoleCommand(actor.userId, adminId, input),
    );
  }

  @Delete(':adminId/roles/:grantId')
  @HttpCode(204)
  @AuditAdminMutation('admin.role.revoke')
  @RequireAdminPrivilege('manage_admin_roles')
  @ApiNoContentResponse({ description: 'The action completed successfully.' })
  revoke(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { adminId, grantId }: RoleAssignmentParamsDto,
  ): Promise<void> {
    return this.commands.execute(
      new RevokeAdminRoleCommand(actor.userId, adminId, grantId),
    );
  }
}
