import {
  Controller,
  UseGuards,
  Get,
  Post,
  Body,
  Query,
  Param,
  Header,
  StreamableFile,
} from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from '#shared/auth/access-token.guard.js';
import { CurrentAccount } from '#shared/auth/account-context.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';
import { AcademicIdParamsDto } from '#shared/http/academic-id-params.dto.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';
import {
  AvailableCoursesResponseDto,
  AvailableCoursesQueryDto,
  RegisteredTermsResponseDto,
  RegistrationSummaryResponseDto,
  RegistrationWriteDto,
} from '../dtos/registration.dto.js';
import {
  AvailableCoursesQuery,
  RegisteredTermsQuery,
  RegistrationSummaryQuery,
} from '../queries/academic-workflow.js';
import { RegisterCoursesCommand } from '../commands/academic-workflow.js';

@ApiTags('Student registration')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller({ path: 'student/registrations', version: '1' })
export class StudentRegistrationController {
  constructor(
    private readonly queries: QueryBus,
    private readonly commands: CommandBus,
  ) {}

  @Get('available')
  @ApiDtoResponse(AvailableCoursesResponseDto)
  available(
    @CurrentAccount() actor: AccountPrincipal,
    @Query() query: AvailableCoursesQueryDto,
  ): Promise<AvailableCoursesResponseDto> {
    return this.queries.execute(
      new AvailableCoursesQuery(actor, query.semesterId),
    );
  }

  @Get()
  @ApiDtoResponse(RegisteredTermsResponseDto)
  terms(
    @CurrentAccount() actor: AccountPrincipal,
  ): Promise<RegisteredTermsResponseDto> {
    return this.queries.execute(new RegisteredTermsQuery(actor));
  }

  @Get(':id/summary/download')
  @Header('Cache-Control', 'no-store')
  @ApiOkResponse({
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example:
            'Course registration\nFirst Semester, 2026/2027\nCSC101 — Introduction to Computing (3 units)',
        },
      },
    },
  })
  async download(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
  ): Promise<StreamableFile> {
    const summary = await this.queries.execute(
      new RegistrationSummaryQuery(actor, id),
    );
    const lines = [
      'Course registration',
      [summary.firstName, summary.lastName, summary.matricNumber]
        .filter(Boolean)
        .join(' '),
      summary.semesterName + ', ' + summary.academicSession,
      summary.faculty + ' / ' + summary.department,
      summary.programme + ' / ' + summary.academicLevel,
      '',
      ...summary.courses.map(
        (course) =>
          course.code + ' — ' + course.name + ' (' + course.units + ' units)',
      ),
      '',
      'Total units: ' + summary.totalUnits,
    ];
    return new StreamableFile(Buffer.from(lines.join('\n') + '\n', 'utf8'), {
      type: 'text/plain; charset=utf-8',
      disposition: 'attachment; filename="course-registration.txt"',
    });
  }

  @Get(':id')
  @ApiDtoResponse(RegistrationSummaryResponseDto)
  summary(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
  ): Promise<RegistrationSummaryResponseDto> {
    return this.queries.execute(new RegistrationSummaryQuery(actor, id));
  }

  @Post()
  @ApiDtoResponse(RegistrationSummaryResponseDto, 201)
  register(
    @CurrentAccount() actor: AccountPrincipal,
    @Body() input: RegistrationWriteDto,
  ): Promise<RegistrationSummaryResponseDto> {
    return this.commands.execute(new RegisterCoursesCommand(actor, input));
  }
}
