import {
  Controller,
  UseGuards,
  Header,
  Get,
  Patch,
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
  LecturerResultsQueryDto,
  ResultPageQueryDto,
  SaveResultMarksDto,
  ResultDecisionNoteDto,
} from '../dtos/result-write.dto.js';
import {
  ResultGroupPageDto,
  ResultGroupDetailDto,
  SaveMarksResponseDto,
  ResultStateResponseDto,
} from '../dtos/result-review.dto.js';
import {
  ListLecturerResultsQuery,
  ReadResultGroupQuery,
} from '../queries/result-workflow.js';
import {
  SaveResultMarksCommand,
  SubmitResultsCommand,
} from '../commands/result-workflow.js';

@ApiTags('Lecturer results')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminPrivilegeGuard)
@Controller({ path: 'lecturer/results', version: '1' })
export class LecturerResultsController {
  constructor(
    private readonly queries: QueryBus,
    private readonly commands: CommandBus,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiDtoResponse(ResultGroupPageDto)
  @RequireAdminPrivilege('teach_course')
  list(
    @CurrentAccount() actor: AccountPrincipal,
    @Query() query: LecturerResultsQueryDto,
  ): Promise<ResultGroupPageDto> {
    return this.queries.execute(
      new ListLecturerResultsQuery(actor.userId, query),
    );
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  @ApiDtoResponse(ResultGroupDetailDto)
  @RequireAdminPrivilege('teach_course')
  detail(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
    @Query() query: ResultPageQueryDto,
  ): Promise<ResultGroupDetailDto> {
    return this.queries.execute(
      new ReadResultGroupQuery(actor.userId, id, query, 'teaching'),
    );
  }

  @Patch(':id/marks')
  @ApiDtoResponse(SaveMarksResponseDto)
  @RequireAdminPrivilege('grade_result')
  @AuditTransactionalAdminMutation('result.marks.save')
  saveMarks(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
    @Body() input: SaveResultMarksDto,
  ): Promise<SaveMarksResponseDto> {
    return this.commands.execute(
      new SaveResultMarksCommand(actor.userId, id, input),
    );
  }

  @Post(':id/submit')
  @HttpCode(200)
  @ApiDtoResponse(ResultStateResponseDto)
  @RequireAdminPrivilege('grade_result')
  @AuditTransactionalAdminMutation('result.submit')
  submit(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
    @Body() input: ResultDecisionNoteDto,
  ): Promise<ResultStateResponseDto> {
    return this.commands.execute(
      new SubmitResultsCommand(actor.userId, id, input),
    );
  }
}
