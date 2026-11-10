import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { DirectoryQueryDto } from '#shared/http/directory.dto.js';

export class UserDirectoryQueryDto extends DirectoryQueryDto {
  @ApiPropertyOptional({
    type: String,
    description:
      'Related profiles to include: student, admin, or both separated by a space.',
    example: 'student admin',
  })
  override populate: string | undefined = undefined;
}

export class UserIdParamsDto {
  @IsUUID('all', { message: 'Account ID must be a valid UUID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Account ID from the request path.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  userId!: string;
}
