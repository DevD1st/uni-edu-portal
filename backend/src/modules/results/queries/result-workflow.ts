import { Query } from '@nestjs/cqrs';
import type {
  LecturerResultsQueryDto,
  DepartmentResultsQueryDto,
  ResultPageQueryDto,
} from '../dtos/result-write.dto.js';
import type {
  StudentResultHistoryDto,
  StudentResultStatementDto,
} from '../dtos/student-results.dto.js';
import type {
  ResultGroupPageDto,
  ResultGroupDetailDto,
} from '../dtos/result-review.dto.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';
import type { ResultReviewOptionsDto } from '../dtos/result-options.dto.js';

export class ReadReviewOptionsQuery extends Query<ResultReviewOptionsDto> {
  constructor(readonly actorId: string) {
    super();
  }
}

export class ListLecturerResultsQuery extends Query<ResultGroupPageDto> {
  constructor(
    readonly actorId: string,
    readonly query: LecturerResultsQueryDto,
  ) {
    super();
  }
}

export class ListDepartmentResultsQuery extends Query<ResultGroupPageDto> {
  constructor(
    readonly actorId: string,
    readonly query: DepartmentResultsQueryDto,
  ) {
    super();
  }
}

export class ReadResultGroupQuery extends Query<ResultGroupDetailDto> {
  constructor(
    readonly actorId: string,
    readonly id: string,
    readonly query: ResultPageQueryDto,
    readonly scope: 'teaching' | 'department',
  ) {
    super();
  }
}

export class StudentResultHistoryQuery extends Query<StudentResultHistoryDto> {
  constructor(readonly actor: AccountPrincipal) {
    super();
  }
}

export class StudentResultStatementQuery extends Query<StudentResultStatementDto> {
  constructor(
    readonly actor: AccountPrincipal,
    readonly id: string,
  ) {
    super();
  }
}
