import {
  Controller,
  UseGuards,
  Header,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '#shared/auth/access-token.guard.js';
import { CurrentAccount } from '#shared/auth/account-context.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';
import {
  AdminPrivilegeGuard,
  RequireAdminPrivilege,
} from '#shared/admin-authorization/admin-privilege.guard.js';
import { AuditTransactionalAdminMutation } from '#shared/admin-authorization/audit.contracts.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';
import { AcademicIdParamsDto } from '#shared/http/academic-id-params.dto.js';
import {
  DepartmentResultsQueryDto,
  ResultPageQueryDto,
  ResultDecisionNoteDto,
  RequestResultCorrectionsDto,
  ReopenResultDto,
} from '../dtos/result-write.dto.js';
import {
  ResultGroupPageDto,
  ResultGroupDetailDto,
  ResultStateResponseDto,
} from '../dtos/result-review.dto.js';
import {
  ListDepartmentResultsQuery,
  ReadResultGroupQuery,
} from '../queries/result-workflow.js';
import {
  ApproveResultsCommand,
  RequestResultCorrectionsCommand,
  ReopenResultsCommand,
} from '../commands/result-workflow.js';

@ApiTags('Departmental results')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminPrivilegeGuard)
@Controller({ path: 'admin/results', version: '1' })
export class DepartmentResultsController {
  constructor(
    private readonly queries: QueryBus,
    private readonly commands: CommandBus,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiDtoResponse(ResultGroupPageDto)
  list(
    @CurrentAccount() actor: AccountPrincipal,
    @Query() query: DepartmentResultsQueryDto,
  ): Promise<ResultGroupPageDto> {
    return this.queries.execute(
      new ListDepartmentResultsQuery(actor.userId, query),
    );
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  @ApiDtoResponse(ResultGroupDetailDto)
  detail(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
    @Query() query: ResultPageQueryDto,
  ): Promise<ResultGroupDetailDto> {
    return this.queries.execute(
      new ReadResultGroupQuery(actor.userId, id, query, 'department'),
    );
  }

  @Post(':id/approve')
  @HttpCode(200)
  @ApiDtoResponse(ResultStateResponseDto)
  @RequireAdminPrivilege('approve_result')
  @AuditTransactionalAdminMutation('result.approve')
  approve(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
    @Body() input: ResultDecisionNoteDto,
  ): Promise<ResultStateResponseDto> {
    return this.commands.execute(
      new ApproveResultsCommand(actor.userId, id, input),
    );
  }

  @Post(':id/request-corrections')
  @HttpCode(200)
  @ApiDtoResponse(ResultStateResponseDto)
  @RequireAdminPrivilege('review_result')
  @AuditTransactionalAdminMutation('result.request_corrections')
  requestCorrections(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
    @Body() input: RequestResultCorrectionsDto,
  ): Promise<ResultStateResponseDto> {
    return this.commands.execute(
      new RequestResultCorrectionsCommand(actor.userId, id, input),
    );
  }

  @Post(':id/reopen')
  @HttpCode(200)
  @ApiDtoResponse(ResultStateResponseDto)
  @RequireAdminPrivilege('reopen_result')
  @AuditTransactionalAdminMutation('result.reopen')
  reopen(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
    @Body() input: ReopenResultDto,
  ): Promise<ResultStateResponseDto> {
    return this.commands.execute(
      new ReopenResultsCommand(actor.userId, id, input),
    );
  }
}
