import { Query } from '@nestjs/cqrs';
import type {
  AvailableCoursesResponseDto,
  RegisteredTermsResponseDto,
  RegistrationSummaryResponseDto,
  RegistrationRosterResponseDto,
  RegistrationReportQueryDto,
  TeachingOfferingsResponseDto,
  RosterQueryDto,
} from '../dtos/registration.dto.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';

export class AvailableCoursesQuery extends Query<AvailableCoursesResponseDto> {
  constructor(
    readonly actor: AccountPrincipal,
    readonly semesterId?: string,
    readonly studentUserId?: string,
  ) {
    super();
  }
}

export class RegisteredTermsQuery extends Query<RegisteredTermsResponseDto> {
  constructor(readonly actor: AccountPrincipal) {
    super();
  }
}

export class RegistrationSummaryQuery extends Query<RegistrationSummaryResponseDto> {
  constructor(
    readonly actor: AccountPrincipal,
    readonly id: string,
  ) {
    super();
  }
}

export class DepartmentRegistrationReportQuery extends Query<RegistrationRosterResponseDto> {
  constructor(
    readonly actorId: string,
    readonly input: RegistrationReportQueryDto,
  ) {
    super();
  }
}

export class TeachingOfferingsQuery extends Query<TeachingOfferingsResponseDto> {
  constructor(readonly actorId: string) {
    super();
  }
}

export class LecturerRosterQuery extends Query<RegistrationRosterResponseDto> {
  constructor(
    readonly actorId: string,
    readonly id: string,
    readonly input: RosterQueryDto,
  ) {
    super();
  }
}
