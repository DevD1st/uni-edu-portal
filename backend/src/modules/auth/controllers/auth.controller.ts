import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags, ApiNoContentResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from '#shared/auth/access-token.guard.js';
import { CurrentAccount } from '#shared/auth/account-context.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';
import { CreateStudentAccountCommand } from '#shared/auth/user.contracts.js';
import { CreateStudentDto } from '#shared/auth/student-account.dto.js';
import {
  SignInCommand,
  RefreshSessionCommand,
  SignOutCommand,
} from '../commands/impl.js';
import { SignInDto, RefreshDto } from '../dtos/auth.dto.js';
import { AuthRateLimitGuard } from '../guards/auth-rate-limit.guard.js';
import { UserResponseDto } from '#shared/auth/user-response.dto.js';
import { SessionResponseDto } from '../dtos/auth-response.dto.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly commands: CommandBus) {}

  @Post('signup/student')
  @UseGuards(AuthRateLimitGuard)
  @ApiDtoResponse(UserResponseDto, 201)
  signUp(@Body() input: CreateStudentDto): Promise<UserResponseDto> {
    return this.commands.execute(new CreateStudentAccountCommand(input));
  }

  @Post('sign-in')
  @HttpCode(200)
  @UseGuards(AuthRateLimitGuard)
  @ApiDtoResponse(SessionResponseDto)
  signIn(@Body() input: SignInDto): Promise<SessionResponseDto> {
    return this.commands.execute(
      new SignInCommand(input.email, input.password, input.role),
    );
  }

  @Post('refresh')
  @HttpCode(200)
  @UseGuards(AuthRateLimitGuard)
  @ApiDtoResponse(SessionResponseDto)
  refresh(@Body() input: RefreshDto): Promise<SessionResponseDto> {
    return this.commands.execute(new RefreshSessionCommand(input.refreshToken));
  }

  @Post('sign-out')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'The action completed successfully.' })
  signOut(@CurrentAccount() account: AccountPrincipal): Promise<void> {
    return this.commands.execute(new SignOutCommand(account));
  }
}
