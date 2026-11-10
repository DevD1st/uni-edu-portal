import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { GetAcademicReferencesQuery } from '../queries/impl.js';
import { AcademicReferencesResponseDto } from '../dtos/academic-references-response.dto.js';
import { ApiDtoResponse } from '#shared/http/api-dto-response.decorator.js';

@ApiTags('Academic references')
@Controller({ path: 'academic-references', version: '1' })
export class AcademicReferencesController {
  constructor(private readonly queries: QueryBus) {}

  @Get()
  @ApiDtoResponse(AcademicReferencesResponseDto)
  list(): Promise<AcademicReferencesResponseDto> {
    return this.queries.execute(new GetAcademicReferencesQuery());
  }
}
