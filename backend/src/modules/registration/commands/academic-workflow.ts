import { Command } from '@nestjs/cqrs';
import type {
  RegistrationSummaryResponseDto,
  RegistrationWriteDto,
  RosterClosureResponseDto,
} from '../dtos/registration.dto.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';

export class RegisterCoursesCommand extends Command<RegistrationSummaryResponseDto> {
  constructor(
    readonly actor: AccountPrincipal,
    readonly input: RegistrationWriteDto,
    readonly studentUserId?: string,
  ) {
    super();
  }
}

export class CloseRegistrationRosterCommand extends Command<RosterClosureResponseDto> {
  constructor(
    readonly actorId: string,
    readonly id: string,
  ) {
    super();
  }
}
