import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '#shared/auth/access-token.guard.js';
import { CurrentAccount } from '#shared/auth/account-context.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';
import {
  AdminPrivilegeGuard,
  RequireAdminPrivilege,
} from '#shared/admin-authorization/admin-privilege.guard.js';
import { ListAuditEventsDto } from '../dtos/admin-audit.dto.js';
import { GetAuditEventQuery, ListAuditEventsQuery } from '../queries/impl.js';
import {
  AuditEventPageResponseDto,
  AuditEventResponseDto,
} from '../dtos/admin-response.dto.js';
import { AuditEventIdParamsDto } from '../dtos/admin-params.dto.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';

@ApiTags('Admin audit')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminPrivilegeGuard)
@RequireAdminPrivilege('read_audit')
@Controller({ path: 'admin/audit-events', version: '1' })
export class AdminAuditController {
  constructor(private readonly queries: QueryBus) {}

  @Get()
  @ApiDtoResponse(AuditEventPageResponseDto)
  list(
    @CurrentAccount() actor: AccountPrincipal,
    @Query() input: ListAuditEventsDto,
  ): Promise<AuditEventPageResponseDto> {
    return this.queries.execute(new ListAuditEventsQuery(actor.userId, input));
  }

  @Get(':eventId')
  @ApiDtoResponse(AuditEventResponseDto)
  get(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { eventId }: AuditEventIdParamsDto,
  ): Promise<AuditEventResponseDto> {
    return this.queries.execute(new GetAuditEventQuery(actor.userId, eventId));
  }
}
