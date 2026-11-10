import {
  Controller,
  UseGuards,
  Get,
  Post,
  Put,
  Body,
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
import { AcademicIdParamsDto } from '#shared/http/academic-id-params.dto.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';
import {
  AcademicSetupResponseDto,
  FacultySetupResponseDto,
  FacultyWriteDto,
  DepartmentSetupResponseDto,
  DepartmentWriteDto,
  ProgrammeSetupResponseDto,
  ProgrammeWriteDto,
  SessionSetupResponseDto,
  SessionWriteDto,
  SemesterSetupResponseDto,
  SemesterWriteDto,
  SetCurrentSemesterDto,
  AcademicLevelSetupDto,
  SetAcademicLevelStatusDto,
} from '../dtos/academic-setup.dto.js';
import { ReadAcademicSetupQuery } from '../queries/academic-workflow.js';
import {
  SaveFacultyCommand,
  SaveDepartmentCommand,
  SaveProgrammeCommand,
  SaveSessionCommand,
  SaveSemesterCommand,
  SetCurrentSemesterCommand,
  SetAcademicLevelStatusCommand,
} from '../commands/academic-workflow.js';

@ApiTags('Academic setup')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminPrivilegeGuard)
@Controller({ path: 'admin/academic', version: '1' })
export class AcademicSetupController {
  constructor(
    private readonly queries: QueryBus,
    private readonly commands: CommandBus,
  ) {}

  @Get()
  @ApiDtoResponse(AcademicSetupResponseDto)
  read(
    @CurrentAccount() actor: AccountPrincipal,
  ): Promise<AcademicSetupResponseDto> {
    return this.queries.execute(new ReadAcademicSetupQuery(actor.userId));
  }

  @Put('levels/:id/status')
  @ApiDtoResponse(AcademicLevelSetupDto)
  @RequireAdminPrivilege('manage_university')
  @AuditAdminMutation('academic.level.status')
  setLevelStatus(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
    @Body() input: SetAcademicLevelStatusDto,
  ): Promise<AcademicLevelSetupDto> {
    return this.commands.execute(
      new SetAcademicLevelStatusCommand(actor.userId, id, input),
    );
  }

  @Post('faculties')
  @ApiDtoResponse(FacultySetupResponseDto, 201)
  @RequireAdminPrivilege('manage_university')
  @AuditAdminMutation('academic.faculty.create')
  createFaculty(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: FacultyWriteDto,
  ): Promise<FacultySetupResponseDto> {
    return this.commands.execute(new SaveFacultyCommand(actor.userId, input));
  }

  @Put('faculties/:id')
  @ApiDtoResponse(FacultySetupResponseDto)
  @RequireAdminPrivilege('manage_university')
  @AuditAdminMutation('academic.faculty.update')
  updateFaculty(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: FacultyWriteDto,
    @Param() { id }: AcademicIdParamsDto,
  ): Promise<FacultySetupResponseDto> {
    return this.commands.execute(
      new SaveFacultyCommand(actor.userId, input, id),
    );
  }

  @Post('departments')
  @ApiDtoResponse(DepartmentSetupResponseDto, 201)
  @RequireAdminPrivilege('manage_university')
  @AuditAdminMutation('academic.department.create')
  createDepartment(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: DepartmentWriteDto,
  ): Promise<DepartmentSetupResponseDto> {
    return this.commands.execute(
      new SaveDepartmentCommand(actor.userId, input),
    );
  }

  @Put('departments/:id')
  @ApiDtoResponse(DepartmentSetupResponseDto)
  @RequireAdminPrivilege('manage_university')
  @AuditAdminMutation('academic.department.update')
  updateDepartment(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: DepartmentWriteDto,
    @Param() { id }: AcademicIdParamsDto,
  ): Promise<DepartmentSetupResponseDto> {
    return this.commands.execute(
      new SaveDepartmentCommand(actor.userId, input, id),
    );
  }

  @Post('programmes')
  @ApiDtoResponse(ProgrammeSetupResponseDto, 201)
  @RequireAdminPrivilege('manage_department')
  @AuditAdminMutation('academic.programme.create')
  createProgramme(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: ProgrammeWriteDto,
  ): Promise<ProgrammeSetupResponseDto> {
    return this.commands.execute(new SaveProgrammeCommand(actor.userId, input));
  }

  @Put('programmes/:id')
  @ApiDtoResponse(ProgrammeSetupResponseDto)
  @RequireAdminPrivilege('manage_department')
  @AuditAdminMutation('academic.programme.update')
  updateProgramme(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: ProgrammeWriteDto,
    @Param() { id }: AcademicIdParamsDto,
  ): Promise<ProgrammeSetupResponseDto> {
    return this.commands.execute(
      new SaveProgrammeCommand(actor.userId, input, id),
    );
  }

  @Post('sessions')
  @ApiDtoResponse(SessionSetupResponseDto, 201)
  @RequireAdminPrivilege('manage_university')
  @AuditAdminMutation('academic.session.create')
  createSession(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: SessionWriteDto,
  ): Promise<SessionSetupResponseDto> {
    return this.commands.execute(new SaveSessionCommand(actor.userId, input));
  }

  @Put('sessions/:id')
  @ApiDtoResponse(SessionSetupResponseDto)
  @RequireAdminPrivilege('manage_university')
  @AuditAdminMutation('academic.session.update')
  updateSession(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: SessionWriteDto,
    @Param() { id }: AcademicIdParamsDto,
  ): Promise<SessionSetupResponseDto> {
    return this.commands.execute(
      new SaveSessionCommand(actor.userId, input, id),
    );
  }

  @Post('semesters')
  @ApiDtoResponse(SemesterSetupResponseDto, 201)
  @RequireAdminPrivilege('manage_university')
  @AuditAdminMutation('academic.semester.create')
  createSemester(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: SemesterWriteDto,
  ): Promise<SemesterSetupResponseDto> {
    return this.commands.execute(new SaveSemesterCommand(actor.userId, input));
  }

  @Put('semesters/:id')
  @ApiDtoResponse(SemesterSetupResponseDto)
  @RequireAdminPrivilege('manage_university')
  @AuditAdminMutation('academic.semester.update')
  updateSemester(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: SemesterWriteDto,
    @Param() { id }: AcademicIdParamsDto,
  ): Promise<SemesterSetupResponseDto> {
    return this.commands.execute(
      new SaveSemesterCommand(actor.userId, input, id),
    );
  }

  @Put('faculties/:id/current-semester')
  @ApiDtoResponse(FacultySetupResponseDto)
  @RequireAdminPrivilege('manage_university')
  @AuditAdminMutation('academic.faculty.current_semester')
  setCurrentSemester(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
    @Body() input: SetCurrentSemesterDto,
  ): Promise<FacultySetupResponseDto> {
    return this.commands.execute(
      new SetCurrentSemesterCommand(actor.userId, id, input.semesterId),
    );
  }
}
