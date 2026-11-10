import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { normalizeUuidInput } from '#shared/http/uuid-input.js';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class CourseWriteDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString({ message: 'Enter the course code as text.' })
  @Length(1, 32, {
    message: 'Course code must contain between 1 and 32 characters.',
  })
  @ApiProperty({
    type: String,
    description: 'Canonical course code.',
    example: 'CSC101',
  })
  code!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Enter a name as text.' })
  @Length(1, 160, {
    message: 'Name must contain between 1 and 160 characters.',
  })
  @ApiProperty({
    type: String,
    description: 'Title of the course.',
    example: 'Introduction to Computing',
  })
  name!: string;

  @IsInt({
    message: 'Credit units assigned to this course must be a whole number.',
  })
  @Min(1, { message: 'Course credit units must be at least 1.' })
  @Max(32767, { message: 'Course credit units must be at most 32767.' })
  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 32767,
    description: 'Credit units assigned to this course.',
    example: 3,
  })
  units!: number;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(['active', 'inactive'], { message: 'Choose active or inactive.' })
  @ApiPropertyOptional({
    enum: ['active', 'inactive'],
    description:
      'Whether this record can be used in current academic operations.',
    example: 'active',
  })
  status?: 'active' | 'inactive';
}

export class CurriculumWriteDto {
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid course of study ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Programme that includes the course.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  courseOfStudyId!: string;

  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid course ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'University catalog course.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  courseId!: string;
}

export class OfferingWriteDto {
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid course ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'University catalog course.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  courseId!: string;

  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid department ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department that owns the record.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  departmentId!: string;

  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid semester ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Semester used for course registration.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  semesterId!: string;

  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid academic level ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Academic level eligible for this offering.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  academicLevelId!: string;

  @IsOptional()
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid lecturer ID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Administrator assigned to teach the offering.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  lecturerId?: string | null;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(['active', 'inactive'], { message: 'Choose active or inactive.' })
  @ApiPropertyOptional({
    enum: ['active', 'inactive'],
    description:
      'Whether this record can be used in current academic operations.',
    example: 'active',
  })
  status?: 'active' | 'inactive';
}

export class OfferingUpdateDto {
  @IsOptional()
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid lecturer ID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Administrator assigned to teach the offering.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  lecturerId?: string | null;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(['active', 'inactive'], { message: 'Choose active or inactive.' })
  @ApiPropertyOptional({
    enum: ['active', 'inactive'],
    description:
      'Whether this record can be used in current academic operations.',
    example: 'active',
  })
  status?: 'active' | 'inactive';
}

export class DepartmentQueryDto {
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid department ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department that owns the record.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  departmentId!: string;
}

export class CourseResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Identifier of the record.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  id!: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Canonical course code.',
    example: 'CSC101',
  })
  code!: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Title of the course.',
    example: 'Introduction to Computing',
  })
  name!: string;

  @Expose()
  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 32767,
    description: 'Credit units assigned to this course.',
    example: 3,
  })
  units!: number;

  @Expose()
  @ApiProperty({
    enum: ['active', 'inactive'],
    description:
      'Whether this record can be used in current academic operations.',
    example: 'active',
  })
  status!: 'active' | 'inactive';
}

export class CurriculumResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Identifier of the record.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  id!: string;

  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Programme that includes the course.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  courseOfStudyId!: string;

  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'University catalog course.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  courseId!: string;
}

export class OfferingResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Identifier of the record.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  id!: string;

  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'University catalog course.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  courseId!: string;

  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department that owns the record.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  departmentId!: string;

  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Semester used for course registration.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  semesterId!: string;

  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Academic level eligible for this offering.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  academicLevelId!: string;

  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Administrator assigned to teach the offering.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  lecturerId!: string | null;

  @Expose()
  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 32767,
    description: 'Credit units assigned to this course.',
    example: 3,
  })
  units!: number;

  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Grading policy pinned to this offering.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  gradingPolicyId!: string;

  @Expose()
  @ApiProperty({
    enum: ['active', 'inactive'],
    description:
      'Whether this record can be used in current academic operations.',
    example: 'active',
  })
  status!: 'active' | 'inactive';
}

export class LecturerChoiceResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Identifier of the record.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  id!: string;

  @Expose()
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Lecturer’s given name.',
    example: 'Ada',
  })
  firstName!: string | null;

  @Expose()
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Lecturer’s family name.',
    example: 'Okafor',
  })
  lastName!: string | null;
}

export class CourseSetupResponseDto {
  @Expose()
  @Type(() => CourseResponseDto)
  @ApiProperty({
    type: () => [CourseResponseDto],
    description: 'University catalog courses.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        code: 'CSC101',
        name: 'Introduction to Computing',
        units: 3,
        status: 'active',
      },
    ],
  })
  courses!: CourseResponseDto[];

  @Expose()
  @Type(() => CurriculumResponseDto)
  @ApiProperty({
    type: () => [CurriculumResponseDto],
    description: 'Programme links in the administrator’s scope.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        courseOfStudyId: '0191e192-67ad-746b-9acb-c850234b408a',
        courseId: '0191e192-67ad-746b-9acb-c850234b408a',
      },
    ],
  })
  curriculum!: CurriculumResponseDto[];

  @Expose()
  @Type(() => OfferingResponseDto)
  @ApiProperty({
    type: () => [OfferingResponseDto],
    description: 'Course offerings in the administrator’s scope.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        courseId: '0191e192-67ad-746b-9acb-c850234b408a',
        departmentId: '0191e192-67ad-746b-9acb-c850234b408a',
        semesterId: '0191e192-67ad-746b-9acb-c850234b408a',
        academicLevelId: '0191e192-67ad-746b-9acb-c850234b408a',
        lecturerId: '0191e192-67ad-746b-9acb-c850234b408a',
        units: 3,
        gradingPolicyId: '0191e192-67ad-746b-9acb-c850234b408a',
        status: 'active',
      },
    ],
  })
  offerings!: OfferingResponseDto[];
}

export class LecturerChoicesResponseDto {
  @Expose()
  @Type(() => LecturerChoiceResponseDto)
  @ApiProperty({
    type: () => [LecturerChoiceResponseDto],
    description:
      'Administrators with teaching authority in the selected department.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        firstName: 'Ada',
        lastName: 'Okafor',
      },
    ],
  })
  lecturers!: LecturerChoiceResponseDto[];
}
