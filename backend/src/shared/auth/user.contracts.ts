import { Command, Query } from '@nestjs/cqrs';
import type { AccountRole } from './account-context.js';
import type { CreateStudentDto } from './student-account.dto.js';
import type { UserResponseDto } from './user-response.dto.js';

export interface AuthAccount {
  id: string;
  role: AccountRole;
  authVersion: number;
}

export interface AccountCredentials extends AuthAccount {
  hashedPassword: string;
}

export class CreateStudentAccountCommand extends Command<UserResponseDto> {
  constructor(
    readonly input: CreateStudentDto,
    readonly actorUserId?: string,
  ) {
    super();
  }
}

export class FindAccountCredentialsQuery extends Query<AccountCredentials | null> {
  constructor(
    readonly email: string,
    readonly role: AccountRole,
  ) {
    super();
  }
}

export class GetAuthAccountQuery extends Query<AuthAccount | null> {
  constructor(readonly userId: string) {
    super();
  }
}

export class AdvanceAuthVersionCommand extends Command<AuthAccount> {
  constructor(
    readonly userId: string,
    readonly expectedVersion: number,
  ) {
    super();
  }
}

export class AccountAuthChangedEvent {
  constructor(
    readonly userId: string,
    readonly authVersion: number,
  ) {}
}
