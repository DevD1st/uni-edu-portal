import { ApplicationError } from '#core/http/application-error.js';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class DirectoryQueryDto {
  @IsOptional()
  @IsUUID('all', { message: 'Page cursor must be a valid UUID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Cursor returned by the previous page.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  cursor?: string;

  @Type(() => Number)
  @IsInt({ message: 'Page size must be a whole number.' })
  @Min(1, { message: 'Page size must be at least 1.' })
  @Max(100, { message: 'Page size must be 100 or fewer.' })
  @ApiPropertyOptional({
    type: Number,
    default: 25,
    minimum: 1,
    maximum: 100,
    description: 'Maximum number of results to return.',
    example: 25,
  })
  limit = 25;

  @IsOptional()
  @IsString({ message: 'Related records must be text.' })
  @MaxLength(120, {
    message: 'Related records must be 120 characters or fewer.',
  })
  @ApiPropertyOptional({
    type: String,
    description:
      'Related records to include, separated by spaces. Omit this field if the endpoint has no supported relations.',
    example: '',
  })
  populate?: string;
}

export function parsePopulation(
  value: string | undefined,
  allowlist: readonly string[],
): Set<string> {
  const relations = new Set(value?.trim().split(/\s+/).filter(Boolean) ?? []);
  if ([...relations].some((relation) => !allowlist.includes(relation))) {
    throw new ApplicationError(
      HttpStatus.BAD_REQUEST,
      'Choose related records listed for this endpoint in the API documentation.',
    );
  }
  return relations;
}
