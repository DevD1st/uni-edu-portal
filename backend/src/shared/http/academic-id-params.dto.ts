import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { normalizeUuidInput } from '#shared/http/uuid-input.js';
import { IsUUID } from 'class-validator';

export class AcademicIdParamsDto {
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid record ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Identifier of the academic record in the request path.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  id!: string;
}
