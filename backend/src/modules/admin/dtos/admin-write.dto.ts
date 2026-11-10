import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { PRIVILEGES } from '#shared/admin-authorization/privilege.js';
import type { Privilege } from '#shared/admin-authorization/privilege.js';

export class AssignAdminRoleDto {
  @IsUUID('all', { message: 'Role ID must be a valid UUID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the role to assign.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  roleId!: string;

  @IsOptional()
  @IsUUID('all', { message: 'Department ID must be a valid UUID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'Department where the assignment applies. Null means university-wide.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  departmentId?: string | null;
}

export class CreateAdminDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(254, { message: 'Email address must be 254 characters or fewer.' })
  @ApiProperty({
    type: String,
    format: 'email',
    description: 'Email used to sign in.',
    example: 'ada.okafor@example.test',
  })
  email!: string;

  @IsString({ message: 'Password must be text.' })
  @Length(12, 72, { message: 'Password must be between 12 and 72 characters.' })
  @ApiProperty({
    type: String,
    format: 'password',
    writeOnly: true,
    description: 'Password used to sign in.',
    example: 'Example-only-password!',
  })
  password!: string;

  @IsOptional()
  @IsString({ message: 'First name must be text.' })
  @MaxLength(100, { message: 'First name must be 100 characters or fewer.' })
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Given name, if provided.',
    example: 'Ada',
  })
  firstName?: string | null;

  @IsOptional()
  @IsString({ message: 'Last name must be text.' })
  @MaxLength(100, { message: 'Last name must be 100 characters or fewer.' })
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Family name, if provided.',
    example: 'Okafor',
  })
  lastName?: string | null;

  @IsOptional()
  @IsUUID('all', { message: 'Role ID must be a valid UUID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description:
      'ID of the role to assign. An HOD can omit this to provision a lecturer in their department.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  roleId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Department ID must be a valid UUID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'Department where the assignment applies. Null means university-wide.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  departmentId?: string | null;
}

export class WriteRoleDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString({ message: 'Role name must be text.' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Use lowercase letters and digits, with single hyphens between words.',
  })
  @MaxLength(80, { message: 'Role name must be 80 characters or fewer.' })
  @ApiProperty({
    type: String,
    description:
      'Unique role name using lowercase letters, digits, and hyphens.',
    example: 'course-coordinator',
  })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Role description must be text.' })
  @MaxLength(255, {
    message: 'Role description must be 255 characters or fewer.',
  })
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'What the role allows the administrator to do.',
    example: 'Coordinates undergraduate courses.',
  })
  description?: string | null;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsArray({ message: 'Privileges must be a list.' })
  @ArrayUnique(undefined, { message: 'Each privilege can appear only once.' })
  @ArrayMaxSize(PRIVILEGES.length, {
    message: 'Select only the listed privileges.',
  })
  @IsIn(PRIVILEGES, {
    each: true,
    message: 'Each privilege must be one of the supported values.',
  })
  @ApiPropertyOptional({
    enum: PRIVILEGES,
    isArray: true,
    description: 'Permissions granted to administrators assigned this role.',
    example: ['teach_course', 'read_registration'],
  })
  privileges?: Privilege[];
}
