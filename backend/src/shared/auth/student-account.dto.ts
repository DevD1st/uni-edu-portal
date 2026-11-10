import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';

export class PlacementDto {
  @IsOptional()
  @IsUUID('all', { message: 'Academic level ID must be a valid UUID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Student’s current academic level.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  academicLevelId?: string | null;

  @IsOptional()
  @IsUUID('all', { message: 'Programme ID must be a valid UUID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Student’s programme of study.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  courseOfStudyId?: string | null;

  @IsOptional()
  @IsUUID('all', { message: 'Department ID must be a valid UUID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Student’s department. It can be inferred from the programme.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  departmentId?: string | null;

  @IsOptional()
  @IsUUID('all', { message: 'Faculty ID must be a valid UUID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Student’s faculty. It can be inferred from the department.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  facultyId?: string | null;
}

export class CreateStudentDto extends PlacementDto {
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
}
