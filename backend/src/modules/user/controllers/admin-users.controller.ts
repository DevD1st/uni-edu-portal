import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
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
import { CreateStudentAccountCommand } from '#shared/auth/user.contracts.js';
import {
  AdminPrivilegeGuard,
  RequireAdminPrivilege,
} from '#shared/admin-authorization/admin-privilege.guard.js';
import { AuditAdminMutation } from '#shared/admin-authorization/audit.contracts.js';
import {
  CreateStudentDto,
  PlacementDto,
} from '#shared/auth/student-account.dto.js';
import { UpdateUserDto, UpdateUserStatusDto } from '../dtos/user-write.dto.js';
import {
  DeleteUserAccountCommand,
  ManageUserStatusCommand,
  RevokeUserSessionsCommand,
  UpdateStudentPlacementCommand,
  UpdateUserProfileCommand,
} from '../commands/impl.js';
import { GetUserProfileQuery, ListUsersQuery } from '../queries/impl.js';
import {
  UserPageResponseDto,
  UserResponseDto,
} from '#shared/auth/user-response.dto.js';
import {
  UserDirectoryQueryDto,
  UserIdParamsDto,
} from '../dtos/user-params.dto.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';

@ApiTags('Admin users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminPrivilegeGuard)
@Controller({ path: 'admin/users', version: '1' })
export class AdminUsersController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  @Get()
  @RequireAdminPrivilege('read_user')
  @ApiDtoResponse(UserPageResponseDto)
  list(
    @CurrentAccount() actor: AccountPrincipal,
    @Query() input: UserDirectoryQueryDto,
  ): Promise<UserPageResponseDto> {
    return this.queries.execute(new ListUsersQuery(actor.userId, input));
  }

  @Get(':userId')
  @RequireAdminPrivilege('read_user')
  @ApiDtoResponse(UserResponseDto)
  get(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { userId }: UserIdParamsDto,
    @Query() input: UserDirectoryQueryDto,
  ): Promise<UserResponseDto> {
    return this.queries.execute(
      new GetUserProfileQuery(userId, actor.userId, input.populate),
    );
  }

  @Post('students')
  @AuditAdminMutation('user.create_student')
  @RequireAdminPrivilege('create_student')
  @ApiDtoResponse(UserResponseDto, 201)
  createStudent(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: CreateStudentDto,
  ): Promise<UserResponseDto> {
    return this.commands.execute(
      new CreateStudentAccountCommand(input, actor.userId),
    );
  }

  @Patch(':userId')
  @AuditAdminMutation('user.update')
  @RequireAdminPrivilege('update_user')
  @ApiDtoResponse(UserResponseDto)
  update(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { userId }: UserIdParamsDto,
    @Body() input: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.commands.execute(
      new UpdateUserProfileCommand(userId, input, actor.userId),
    );
  }

  @Put(':userId/student-placement')
  @AuditAdminMutation('user.update_placement')
  @RequireAdminPrivilege('update_student_placement')
  @ApiDtoResponse(UserResponseDto)
  placement(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { userId }: UserIdParamsDto,
    @Body() input: PlacementDto,
  ): Promise<UserResponseDto> {
    return this.commands.execute(
      new UpdateStudentPlacementCommand(actor.userId, userId, input),
    );
  }

  @Patch(':userId/status')
  @AuditAdminMutation('user.set_status')
  @RequireAdminPrivilege('suspend_user')
  @ApiDtoResponse(UserResponseDto)
  status(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { userId }: UserIdParamsDto,
    @Body() input: UpdateUserStatusDto,
  ): Promise<UserResponseDto> {
    return this.commands.execute(
      new ManageUserStatusCommand(actor.userId, userId, input.status),
    );
  }

  @Post(':userId/revoke-sessions')
  @HttpCode(204)
  @AuditAdminMutation('user.revoke_sessions')
  @RequireAdminPrivilege('revoke_user_sessions')
  @ApiNoContentResponse({ description: 'The action completed successfully.' })
  revokeSessions(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { userId }: UserIdParamsDto,
  ): Promise<void> {
    return this.commands.execute(
      new RevokeUserSessionsCommand(actor.userId, userId),
    );
  }

  @Delete(':userId')
  @HttpCode(204)
  @AuditAdminMutation('user.delete')
  @RequireAdminPrivilege('delete_user')
  @ApiNoContentResponse({ description: 'The action completed successfully.' })
  delete(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { userId }: UserIdParamsDto,
  ): Promise<void> {
    return this.commands.execute(
      new DeleteUserAccountCommand(userId, actor.userId),
    );
  }
}
