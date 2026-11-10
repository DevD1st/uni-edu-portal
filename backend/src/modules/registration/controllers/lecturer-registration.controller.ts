import {
  Controller,
  UseGuards,
  Get,
  Post,
  Query,
  Param,
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
import { AcademicIdParamsDto } from '#shared/http/academic-id-params.dto.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';
import {
  TeachingOfferingsResponseDto,
  RegistrationRosterResponseDto,
  RosterQueryDto,
  RosterClosureResponseDto,
} from '../dtos/registration.dto.js';
import {
  TeachingOfferingsQuery,
  LecturerRosterQuery,
} from '../queries/academic-workflow.js';
import { CloseRegistrationRosterCommand } from '../commands/academic-workflow.js';

@ApiTags('Lecturer rosters')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminPrivilegeGuard)
@Controller({ path: 'lecturer/offerings', version: '1' })
export class LecturerRegistrationController {
  constructor(
    private readonly queries: QueryBus,
    private readonly commands: CommandBus,
  ) {}

  @Get()
  @ApiDtoResponse(TeachingOfferingsResponseDto)
  @RequireAdminPrivilege('teach_course')
  offerings(
    @CurrentAccount() actor: AccountPrincipal,
  ): Promise<TeachingOfferingsResponseDto> {
    return this.queries.execute(new TeachingOfferingsQuery(actor.userId));
  }

  @Get(':id/roster')
  @ApiDtoResponse(RegistrationRosterResponseDto)
  @RequireAdminPrivilege('teach_course')
  roster(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
    @Query() query: RosterQueryDto,
  ): Promise<RegistrationRosterResponseDto> {
    return this.queries.execute(
      new LecturerRosterQuery(actor.userId, id, query),
    );
  }

  @Post(':id/close-registration')
  @HttpCode(200)
  @ApiDtoResponse(RosterClosureResponseDto)
  @RequireAdminPrivilege('teach_course')
  @AuditTransactionalAdminMutation('registration.close_roster')
  close(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
  ): Promise<RosterClosureResponseDto> {
    return this.commands.execute(
      new CloseRegistrationRosterCommand(actor.userId, id),
    );
  }
}
