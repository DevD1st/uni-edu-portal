import {
  Controller,
  UseGuards,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Query,
  Param,
  HttpCode,
} from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags, ApiNoContentResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from '#shared/auth/access-token.guard.js';
import { CurrentAccount } from '#shared/auth/account-context.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';
import {
  AdminPrivilegeGuard,
  RequireAdminPrivilege,
} from '#shared/admin-authorization/admin-privilege.guard.js';
import {
  AuditAdminMutation,
  AuditTransactionalAdminMutation,
} from '#shared/admin-authorization/audit.contracts.js';
import { AcademicIdParamsDto } from '#shared/http/academic-id-params.dto.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';
import {
  CourseSetupResponseDto,
  LecturerChoicesResponseDto,
  DepartmentQueryDto,
  CourseResponseDto,
  CourseWriteDto,
  CurriculumResponseDto,
  CurriculumWriteDto,
  OfferingResponseDto,
  OfferingWriteDto,
  OfferingUpdateDto,
} from '../dtos/course-setup.dto.js';
import {
  ReadCourseSetupQuery,
  ListLecturerChoicesQuery,
} from '../queries/academic-workflow.js';
import {
  SaveCourseCommand,
  AddCurriculumCourseCommand,
  RemoveCurriculumCourseCommand,
  CreateOfferingCommand,
  UpdateOfferingCommand,
} from '../commands/academic-workflow.js';

@ApiTags('Course setup')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminPrivilegeGuard)
@Controller({ path: 'admin/courses', version: '1' })
export class CourseSetupController {
  constructor(
    private readonly queries: QueryBus,
    private readonly commands: CommandBus,
  ) {}

  @Get()
  @ApiDtoResponse(CourseSetupResponseDto)
  read(
    @CurrentAccount() actor: AccountPrincipal,
  ): Promise<CourseSetupResponseDto> {
    return this.queries.execute(new ReadCourseSetupQuery(actor.userId));
  }

  @Get('lecturers')
  @ApiDtoResponse(LecturerChoicesResponseDto)
  @RequireAdminPrivilege('manage_department')
  lecturers(
    @CurrentAccount() actor: AccountPrincipal,
    @Query() query: DepartmentQueryDto,
  ): Promise<LecturerChoicesResponseDto> {
    return this.queries.execute(
      new ListLecturerChoicesQuery(actor.userId, query.departmentId),
    );
  }

  @Post()
  @ApiDtoResponse(CourseResponseDto, 201)
  @RequireAdminPrivilege('manage_university')
  @AuditAdminMutation('academic.course.create')
  createCourse(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: CourseWriteDto,
  ): Promise<CourseResponseDto> {
    return this.commands.execute(new SaveCourseCommand(actor.userId, input));
  }

  @Put(':id')
  @ApiDtoResponse(CourseResponseDto)
  @RequireAdminPrivilege('manage_university')
  @AuditAdminMutation('academic.course.update')
  updateCourse(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: CourseWriteDto,
    @Param() { id }: AcademicIdParamsDto,
  ): Promise<CourseResponseDto> {
    return this.commands.execute(
      new SaveCourseCommand(actor.userId, input, id),
    );
  }

  @Post('curriculum')
  @ApiDtoResponse(CurriculumResponseDto, 201)
  @RequireAdminPrivilege('manage_department')
  @AuditAdminMutation('academic.curriculum.add')
  addCurriculum(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: CurriculumWriteDto,
  ): Promise<CurriculumResponseDto> {
    return this.commands.execute(
      new AddCurriculumCourseCommand(actor.userId, input),
    );
  }

  @Delete('curriculum/:id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'The academic record was updated.' })
  @RequireAdminPrivilege('manage_department')
  @AuditAdminMutation('academic.curriculum.remove')
  removeCurriculum(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
  ): Promise<void> {
    return this.commands.execute(
      new RemoveCurriculumCourseCommand(actor.userId, id),
    );
  }

  @Post('offerings')
  @ApiDtoResponse(OfferingResponseDto, 201)
  @RequireAdminPrivilege('manage_department')
  @AuditAdminMutation('academic.offering.create')
  createOffering(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: OfferingWriteDto,
  ): Promise<OfferingResponseDto> {
    return this.commands.execute(
      new CreateOfferingCommand(actor.userId, input),
    );
  }

  @Patch('offerings/:id')
  @ApiDtoResponse(OfferingResponseDto)
  @RequireAdminPrivilege('manage_department')
  @AuditTransactionalAdminMutation('academic.offering.update')
  updateOffering(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
    @Body() input: OfferingUpdateDto,
  ): Promise<OfferingResponseDto> {
    return this.commands.execute(
      new UpdateOfferingCommand(actor.userId, id, input),
    );
  }
}
