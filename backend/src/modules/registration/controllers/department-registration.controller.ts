import {
  Controller,
  UseGuards,
  Get,
  Header,
  Post,
  Body,
  Query,
  Param,
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
import { AuditAdminMutation } from '#shared/admin-authorization/audit.contracts.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';
import {
  AvailableCoursesResponseDto,
  RegistrationRosterResponseDto,
  RegistrationReportQueryDto,
  RegistrationSummaryResponseDto,
  RegistrationWriteDto,
  RegistrationStudentParamsDto,
} from '../dtos/registration.dto.js';
import {
  AvailableCoursesQuery,
  DepartmentRegistrationReportQuery,
} from '../queries/academic-workflow.js';
import { RegisterCoursesCommand } from '../commands/academic-workflow.js';

@ApiTags('Department registration')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminPrivilegeGuard)
@Controller({ path: 'admin/registrations', version: '1' })
export class DepartmentRegistrationController {
  constructor(
    private readonly queries: QueryBus,
    private readonly commands: CommandBus,
  ) {}

  @Get()
  @ApiDtoResponse(RegistrationRosterResponseDto)
  @RequireAdminPrivilege('read_registration')
  report(
    @CurrentAccount() actor: AccountPrincipal,
    @Query() query: RegistrationReportQueryDto,
  ): Promise<RegistrationRosterResponseDto> {
    return this.queries.execute(
      new DepartmentRegistrationReportQuery(actor.userId, query),
    );
  }

  @Post('students/:userId')
  @ApiDtoResponse(RegistrationSummaryResponseDto, 201)
  @RequireAdminPrivilege('register_student_courses')
  @AuditAdminMutation('registration.register_for_student')
  register(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: RegistrationWriteDto,
    @Param() { userId }: RegistrationStudentParamsDto,
  ): Promise<RegistrationSummaryResponseDto> {
    return this.commands.execute(
      new RegisterCoursesCommand(actor, input, userId),
    );
  }

  @Get('students/:userId/available')
  @Header('Cache-Control', 'no-store')
  @RequireAdminPrivilege('register_student_courses')
  @ApiDtoResponse(AvailableCoursesResponseDto)
  available(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { userId }: RegistrationStudentParamsDto,
  ): Promise<AvailableCoursesResponseDto> {
    return this.queries.execute(
      new AvailableCoursesQuery(actor, undefined, userId),
    );
  }
}
