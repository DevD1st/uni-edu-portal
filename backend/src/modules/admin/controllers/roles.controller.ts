import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
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
import { DirectoryQueryDto } from '#shared/http/directory.dto.js';
import { WriteRoleDto } from '../dtos/admin-write.dto.js';
import { DeleteRoleCommand, SaveRoleCommand } from '../commands/impl.js';
import { ListRolesQuery } from '../queries/impl.js';
import {
  RolePageResponseDto,
  RoleResponseDto,
} from '../dtos/admin-response.dto.js';
import { RoleIdParamsDto } from '../dtos/admin-params.dto.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';

@ApiTags('Admin roles')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminPrivilegeGuard)
@Controller({ path: 'admin/roles', version: '1' })
export class RolesController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  @Get()
  @RequireAdminPrivilege('read_role')
  @ApiDtoResponse(RolePageResponseDto)
  list(
    @CurrentAccount() actor: AccountPrincipal,
    @Query() input: DirectoryQueryDto,
  ): Promise<RolePageResponseDto> {
    return this.queries.execute(new ListRolesQuery(actor.userId, input));
  }

  @Post()
  @AuditAdminMutation('role.create')
  @RequireAdminPrivilege('manage_roles')
  @ApiDtoResponse(RoleResponseDto, 201)
  create(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: WriteRoleDto,
  ): Promise<RoleResponseDto> {
    return this.commands.execute(new SaveRoleCommand(actor.userId, input));
  }

  @Put(':roleId')
  @AuditAdminMutation('role.update')
  @RequireAdminPrivilege('manage_roles')
  @ApiDtoResponse(RoleResponseDto)
  update(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { roleId }: RoleIdParamsDto,
    @Body() input: WriteRoleDto,
  ): Promise<RoleResponseDto> {
    return this.commands.execute(
      new SaveRoleCommand(actor.userId, input, roleId),
    );
  }

  @Delete(':roleId')
  @HttpCode(204)
  @AuditAdminMutation('role.delete')
  @RequireAdminPrivilege('manage_roles')
  @ApiNoContentResponse({ description: 'The action completed successfully.' })
  delete(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { roleId }: RoleIdParamsDto,
  ): Promise<void> {
    return this.commands.execute(new DeleteRoleCommand(actor.userId, roleId));
  }
}
