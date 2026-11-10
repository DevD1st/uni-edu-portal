import {
  Controller,
  UseGuards,
  Header,
  Get,
  Param,
  StreamableFile,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from '#shared/auth/access-token.guard.js';
import { CurrentAccount } from '#shared/auth/account-context.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';
import { AcademicIdParamsDto } from '#shared/http/academic-id-params.dto.js';
import {
  StudentResultHistoryDto,
  StudentResultStatementDto,
} from '../dtos/student-results.dto.js';
import {
  StudentResultHistoryQuery,
  StudentResultStatementQuery,
} from '../queries/result-workflow.js';

@ApiTags('Student results')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller({ path: 'student/results', version: '1' })
export class StudentResultsController {
  constructor(private readonly queries: QueryBus) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiDtoResponse(StudentResultHistoryDto)
  history(
    @CurrentAccount() actor: AccountPrincipal,
  ): Promise<StudentResultHistoryDto> {
    return this.queries.execute(new StudentResultHistoryQuery(actor));
  }

  @Get(':id/statement/download')
  @Header('Cache-Control', 'no-store')
  @ApiOkResponse({
    content: {
      'text/plain': {
        schema: {
          type: 'string',
          example:
            'Result statement\nCSC101 | CA 24.50 | Exam 49.25 | Total 73.75 | A',
        },
      },
    },
  })
  async download(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
  ): Promise<StreamableFile> {
    const result = await this.queries.execute(
      new StudentResultStatementQuery(actor, id),
    );
    const lines = [
      'Result statement',
      [result.firstName, result.lastName, result.matricNumber]
        .filter(Boolean)
        .join(' '),
      result.semesterName + ', ' + result.academicSession,
      result.department +
        ' / ' +
        result.programme +
        ' / ' +
        result.academicLevel,
      '',
      ...result.courses.map(
        (course) =>
          course.code +
          ' — ' +
          course.name +
          ' | CA ' +
          course.caScore.toFixed(2) +
          ' | Exam ' +
          course.examScore.toFixed(2) +
          ' | Total ' +
          course.totalScore.toFixed(2) +
          ' | ' +
          course.grade +
          ' | ' +
          course.units +
          ' units',
      ),
      '',
      'Approved credit units: ' + result.approvedUnits,
      'Semester GPA: ' + (result.gpa?.toFixed(2) ?? 'Unavailable'),
      'CGPA: ' + (result.cgpa?.toFixed(2) ?? 'Unavailable'),
    ];
    return new StreamableFile(Buffer.from(lines.join('\n') + '\n', 'utf8'), {
      type: 'text/plain; charset=utf-8',
      disposition: 'attachment; filename="result-statement.txt"',
    });
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  @ApiDtoResponse(StudentResultStatementDto)
  statement(
    @CurrentAccount() actor: AccountPrincipal,
    @Param() { id }: AcademicIdParamsDto,
  ): Promise<StudentResultStatementDto> {
    return this.queries.execute(new StudentResultStatementQuery(actor, id));
  }
}
