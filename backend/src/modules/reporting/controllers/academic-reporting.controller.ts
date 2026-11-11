import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AdminPrivilegeGuard,
  RequireAdminPrivilege,
} from '#shared/admin-authorization/admin-privilege.guard.js';
import { CurrentAccount } from '#shared/auth/account-context.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';
import { AccessTokenGuard } from '#shared/auth/access-token.guard.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';
import {
  AcademicOverviewDto,
  AcademicReportOptionsDto,
  AcademicReportQueryDto,
  CoursePerformancePageDto,
  CourseReportQueryDto,
} from '../dtos/academic-report.dto.js';
import {
  ListCoursePerformanceQuery,
  ReadAcademicOverviewQuery,
  ReadReportOptionsQuery,
} from '../queries/academic-report.js';

@ApiTags('Academic reports')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminPrivilegeGuard)
@RequireAdminPrivilege('read_reports')
@Controller({ path: 'admin/reports', version: '1' })
export class AcademicReportingController {
  constructor(private readonly queries: QueryBus) {}

  @Get('options')
  @Header('Cache-Control', 'no-store')
  @ApiDtoResponse(AcademicReportOptionsDto)
  options(
    @CurrentAccount() actor: AccountPrincipal,
  ): Promise<AcademicReportOptionsDto> {
    return this.queries.execute(new ReadReportOptionsQuery(actor.userId));
  }

  @Get('overview')
  @Header('Cache-Control', 'no-store')
  @ApiDtoResponse(AcademicOverviewDto)
  overview(
    @CurrentAccount() actor: AccountPrincipal,
    @Query() input: AcademicReportQueryDto,
  ): Promise<AcademicOverviewDto> {
    return this.queries.execute(
      new ReadAcademicOverviewQuery(actor.userId, input),
    );
  }

  @Get('courses')
  @Header('Cache-Control', 'no-store')
  @ApiDtoResponse(CoursePerformancePageDto)
  courses(
    @CurrentAccount() actor: AccountPrincipal,
    @Query() input: CourseReportQueryDto,
  ): Promise<CoursePerformancePageDto> {
    return this.queries.execute(
      new ListCoursePerformanceQuery(actor.userId, input),
    );
  }
}
