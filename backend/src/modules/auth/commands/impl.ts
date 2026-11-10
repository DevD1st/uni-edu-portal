import { Command } from '@nestjs/cqrs';
import type {
  AccountPrincipal,
  AccountRole,
} from '#shared/auth/account-context.js';
import type { SessionResponseDto } from '../dtos/auth-response.dto.js';

export class SignInCommand extends Command<SessionResponseDto> {
  constructor(
    readonly email: string,
    readonly password: string,
    readonly role: AccountRole,
  ) {
    super();
  }
}
export class RefreshSessionCommand extends Command<SessionResponseDto> {
  constructor(readonly token: string) {
    super();
  }
}
export class SignOutCommand extends Command<void> {
  constructor(readonly account: AccountPrincipal) {
    super();
  }
}
export class ClearRevokedSessionCommand extends Command<void> {
  constructor(
    readonly userId: string,
    readonly authVersion: number,
  ) {
    super();
  }
}
