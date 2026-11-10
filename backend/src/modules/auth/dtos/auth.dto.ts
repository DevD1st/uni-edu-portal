import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsString, Length, MaxLength } from 'class-validator';
import type { AccountRole } from '#shared/auth/account-context.js';

export class SignInDto {
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
  @Length(1, 72, {
    message: 'Enter password using no more than 72 characters.',
  })
  @ApiProperty({
    type: String,
    format: 'password',
    writeOnly: true,
    description: 'Password used to sign in.',
    example: 'Example-only-password!',
  })
  password!: string;

  @IsIn(['student', 'admin'], {
    message: 'Choose either student or admin as the account type.',
  })
  @ApiProperty({
    enum: ['student', 'admin'],
    description: 'Type of account to sign in to.',
    example: 'student',
  })
  role!: AccountRole;
}

export class RefreshDto {
  @IsString({ message: 'Refresh token must be text.' })
  @Length(1, 4096, {
    message: 'Enter refresh token using no more than 4096 characters.',
  })
  @ApiProperty({
    type: String,
    writeOnly: true,
    description: 'Refresh token from the current session.',
    example: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleGFtcGxlIn0.example-signature',
  })
  refreshToken!: string;
}
