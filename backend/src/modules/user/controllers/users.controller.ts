import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags, ApiNoContentResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from '#shared/auth/access-token.guard.js';
import { CurrentAccount } from '#shared/auth/account-context.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';
import { AuditAdminMutation } from '#shared/admin-authorization/audit.contracts.js';
import { ChangePasswordDto, ProfileDto } from '../dtos/user-write.dto.js';
import {
  ChangePasswordCommand,
  DeleteUserAccountCommand,
  UpdateUserProfileCommand,
} from '../commands/impl.js';
import { GetUserProfileQuery } from '../queries/impl.js';
import { UserResponseDto } from '#shared/auth/user-response.dto.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
  ) {}

  @Get('me')
  @ApiDtoResponse(UserResponseDto)
  me(@CurrentAccount() account: AccountPrincipal): Promise<UserResponseDto> {
    return this.queries.execute(new GetUserProfileQuery(account.userId));
  }

  @Patch('me')
  @AuditAdminMutation('user.update')
  @ApiDtoResponse(UserResponseDto)
  update(
    @CurrentAccount() account: AccountPrincipal,
    @Body() input: ProfileDto,
  ): Promise<UserResponseDto> {
    return this.commands.execute(
      new UpdateUserProfileCommand(account.userId, input),
    );
  }

  @Patch('me/password')
  @HttpCode(204)
  @AuditAdminMutation('user.change_password')
  @ApiNoContentResponse({ description: 'The action completed successfully.' })
  password(
    @CurrentAccount() account: AccountPrincipal,
    @Body() input: ChangePasswordDto,
  ): Promise<void> {
    return this.commands.execute(
      new ChangePasswordCommand(
        account.userId,
        input.currentPassword,
        input.newPassword,
      ),
    );
  }

  @Delete('me')
  @HttpCode(204)
  @AuditAdminMutation('user.delete')
  @ApiNoContentResponse({ description: 'The action completed successfully.' })
  delete(@CurrentAccount() account: AccountPrincipal): Promise<void> {
    return this.commands.execute(new DeleteUserAccountCommand(account.userId));
  }
}
