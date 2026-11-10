import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const normalizedEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class ProfileDto {
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
}

export class UpdateUserDto extends ProfileDto {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Transform(normalizedEmail)
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(254, { message: 'Email address must be 254 characters or fewer.' })
  @ApiPropertyOptional({
    type: String,
    format: 'email',
    description: 'Email used to sign in.',
    example: 'ada.okafor@example.test',
  })
  email?: string;
}

export class ChangePasswordDto {
  @IsString({ message: 'Current password must be text.' })
  @Length(1, 72, {
    message: 'Enter current password using no more than 72 characters.',
  })
  @ApiProperty({
    type: String,
    format: 'password',
    writeOnly: true,
    description: 'Current account password.',
    example: 'Example-only-password!',
  })
  currentPassword!: string;

  @IsString({ message: 'New password must be text.' })
  @Length(12, 72, {
    message: 'New password must be between 12 and 72 characters.',
  })
  @ApiProperty({
    type: String,
    format: 'password',
    writeOnly: true,
    description: 'New password for the account.',
    example: 'Example-new-password!',
  })
  newPassword!: string;
}

export class UpdateUserStatusDto {
  @IsIn(['active', 'suspended'], {
    message: 'Choose either active or suspended as the account status.',
  })
  @ApiProperty({
    enum: ['active', 'suspended'],
    description: 'Whether the account can sign in.',
    example: 'suspended',
  })
  status!: 'active' | 'suspended';
}
