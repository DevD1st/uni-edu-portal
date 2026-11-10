import { Query } from '@nestjs/cqrs';
import type { DirectoryQueryDto } from '#shared/http/directory.dto.js';
import type { ListAuditEventsDto } from '../dtos/admin-audit.dto.js';
import type {
  AdminPageResponseDto,
  AdminResponseDto,
  AuditEventPageResponseDto,
  AuditEventResponseDto,
  RolePageResponseDto,
} from '../dtos/admin-response.dto.js';

export class ListAdminsQuery extends Query<AdminPageResponseDto> {
  constructor(
    readonly actorUserId: string,
    readonly input: DirectoryQueryDto,
  ) {
    super();
  }
}
export class GetAdminQuery extends Query<AdminResponseDto> {
  constructor(
    readonly actorUserId: string,
    readonly adminId: string,
    readonly populate?: string,
  ) {
    super();
  }
}
export class ListRolesQuery extends Query<RolePageResponseDto> {
  constructor(
    readonly actorUserId: string,
    readonly input: DirectoryQueryDto,
  ) {
    super();
  }
}
export class ListAuditEventsQuery extends Query<AuditEventPageResponseDto> {
  constructor(
    readonly actorUserId: string,
    readonly input: ListAuditEventsDto,
  ) {
    super();
  }
}
export class GetAuditEventQuery extends Query<AuditEventResponseDto> {
  constructor(
    readonly actorUserId: string,
    readonly eventId: string,
  ) {
    super();
  }
}
