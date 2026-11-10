import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { DirectoryQueryDto } from '#shared/http/directory.dto.js';

export class AdminDirectoryQueryDto extends DirectoryQueryDto {
  @ApiPropertyOptional({
    type: String,
    description:
      'Administrator details to include: user, roles, or both separated by a space.',
    example: 'user roles',
  })
  override populate: string | undefined = undefined;
}

export class AdminIdParamsDto {
  @IsUUID('all', { message: 'Administrator profile ID must be a valid UUID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Administrator profile ID from the request path.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  adminId!: string;
}

export class RoleAssignmentParamsDto extends AdminIdParamsDto {
  @IsUUID('all', { message: 'Role assignment ID must be a valid UUID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Role assignment ID from the request path.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  grantId!: string;
}

export class RoleIdParamsDto {
  @IsUUID('all', { message: 'Role ID must be a valid UUID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Role ID from the request path.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  roleId!: string;
}

export class AuditEventIdParamsDto {
  @IsUUID('all', { message: 'Audit event ID must be a valid UUID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Audit event ID from the request path.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  eventId!: string;
}
