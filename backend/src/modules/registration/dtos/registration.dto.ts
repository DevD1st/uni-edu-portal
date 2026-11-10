import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { normalizeUuidInput } from '#shared/http/uuid-input.js';
import { Expose, Type, Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class RegistrationWriteDto {
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid semester ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Semester used for course registration.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  semesterId!: string;

  @IsArray({ message: 'Send the selected offering IDs as a list.' })
  @ArrayNotEmpty({ message: 'Select at least one offering.' })
  @ArrayMaxSize(100, { message: 'Select up to 100 offerings at a time.' })
  @ArrayUnique(undefined, {
    message: 'Each offering can be selected only once.',
  })
  @Transform(normalizeUuidInput)
  @IsUUID('all', {
    each: true,
    message: 'Each selected offering must have a valid ID.',
  })
  @ApiProperty({
    type: [String],
    minItems: 1,
    maxItems: 100,
    uniqueItems: true,
    description: 'Unique offering IDs selected for this semester.',
    example: ['0191e192-67ad-746b-9acb-c850234b408a'],
  })
  offeringIds!: string[];
}

export class AvailableCoursesQueryDto {
  @IsOptional()
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid semester ID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Semester used for course registration.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  semesterId?: string;
}

export class RegistrationReportQueryDto {
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

  @IsOptional()
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid cursor.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Cursor returned by the previous page.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  cursor?: string;

  @Type(() => Number)
  @IsInt({ message: 'Page size must be a whole number.' })
  @Min(1, { message: 'The page size must be at least 1.' })
  @Max(100, { message: 'The page size must be at most 100.' })
  @ApiPropertyOptional({
    type: Number,
    default: 25,
    minimum: 1,
    maximum: 100,
    description: 'Maximum number of items returned.',
    example: 25,
  })
  limit: number = 25;
}

export class RosterQueryDto {
  @IsOptional()
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid cursor.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Cursor returned by the previous page.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  cursor?: string;

  @Type(() => Number)
  @IsInt({ message: 'Page size must be a whole number.' })
  @Min(1, { message: 'The page size must be at least 1.' })
  @Max(100, { message: 'The page size must be at most 100.' })
  @ApiPropertyOptional({
    type: Number,
    default: 25,
    minimum: 1,
    maximum: 100,
    description: 'Maximum number of items returned.',
    example: 25,
  })
  limit: number = 25;
}

export class RegistrationStudentParamsDto {
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid user ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Student account ID from the request path.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  userId!: string;
}

export class AvailableCourseDto {
  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department-owned delivery of the course.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  offeringId!: string;

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
}

export class RegisteredCourseDto {
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
    description: 'Department-owned delivery of the course.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  offeringId!: string;

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
    type: String,
    format: 'uuid',
    description: 'Roster created for the offering.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  resultGroupId!: string;
}

export class AvailableCoursesResponseDto {
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
    type: Number,
    minimum: 1,
    maximum: 32767,
    description:
      'Maximum total credit units a student can register in the semester.',
    example: 24,
  })
  maxUnits!: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Credit units already registered in this semester.',
    example: 0,
  })
  registeredUnits!: number;

  @Expose()
  @Type(() => AvailableCourseDto)
  @ApiProperty({
    type: () => [AvailableCourseDto],
    description: 'Eligible courses with open rosters.',
    example: [
      {
        offeringId: '0191e192-67ad-746b-9acb-c850234b408a',
        courseId: '0191e192-67ad-746b-9acb-c850234b408a',
        code: 'CSC101',
        name: 'Introduction to Computing',
        units: 3,
      },
    ],
  })
  courses!: AvailableCourseDto[];
}

export class RegisteredTermDto {
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
    description: 'Semester used for course registration.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  semesterId!: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Name of the semester.',
    example: 'First Semester',
  })
  semesterName!: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Academic session label.',
    example: '2026/2027',
  })
  academicSession!: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Faculty saved in the semester record.',
    example: 'Faculty of Science',
  })
  faculty!: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Department saved in the semester record.',
    example: 'Computing',
  })
  department!: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Programme saved in the semester record.',
    example: 'BSc Computer Science',
  })
  programme!: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Academic level saved in the semester record.',
    example: '100 Level',
  })
  academicLevel!: string;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total credit units registered in this term.',
    example: 3,
  })
  totalUnits!: number;
}

export class RegisteredTermsResponseDto {
  @Expose()
  @Type(() => RegisteredTermDto)
  @ApiProperty({
    type: () => [RegisteredTermDto],
    description: 'Semesters in which the student has a saved registration.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        semesterId: '0191e192-67ad-746b-9acb-c850234b408a',
        semesterName: 'First Semester',
        academicSession: '2026/2027',
        faculty: 'Faculty of Science',
        department: 'Computing',
        programme: 'BSc Computer Science',
        academicLevel: '100 Level',
        totalUnits: 3,
      },
    ],
  })
  terms!: RegisteredTermDto[];
}

export class RegistrationSummaryResponseDto extends RegisteredTermDto {
  @Expose()
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Student’s given name, if available.',
    example: 'Ada',
  })
  firstName!: string | null;

  @Expose()
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Student’s family name, if available.',
    example: 'Okafor',
  })
  lastName!: string | null;

  @Expose()
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The student’s issued matriculation number, if available.',
    example: '26/1/2/3/42',
  })
  matricNumber!: string | null;

  @Expose()
  @Type(() => RegisteredCourseDto)
  @ApiProperty({
    type: () => [RegisteredCourseDto],
    description: 'The student’s confirmed courses.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        offeringId: '0191e192-67ad-746b-9acb-c850234b408a',
        courseId: '0191e192-67ad-746b-9acb-c850234b408a',
        code: 'CSC101',
        name: 'Introduction to Computing',
        units: 3,
        resultGroupId: '0191e192-67ad-746b-9acb-c850234b408a',
      },
    ],
  })
  courses!: RegisteredCourseDto[];
}

export class RosterStudentResponseDto {
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
    description: 'Department-owned delivery of the course.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  offeringId!: string;

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
    type: String,
    format: 'uuid',
    description: 'Roster created for the offering.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  resultGroupId!: string;

  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Internal student profile ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  studentId!: string;

  @Expose()
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Given name if still available.',
    example: 'Ada',
  })
  firstName!: string | null;

  @Expose()
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Family name if still available.',
    example: 'Okafor',
  })
  lastName!: string | null;

  @Expose()
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Issued matriculation number if still available.',
    example: '26/1/2/3/42',
  })
  matricNumber!: string | null;
}

export class RegistrationRosterResponseDto {
  @Expose()
  @Type(() => RosterStudentResponseDto)
  @ApiProperty({
    type: () => [RosterStudentResponseDto],
    description: 'Enrollments visible in this roster or report.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        offeringId: '0191e192-67ad-746b-9acb-c850234b408a',
        courseId: '0191e192-67ad-746b-9acb-c850234b408a',
        code: 'CSC101',
        name: 'Introduction to Computing',
        units: 3,
        resultGroupId: '0191e192-67ad-746b-9acb-c850234b408a',
        studentId: '0191e192-67ad-746b-9acb-c850234b408a',
        firstName: 'Ada',
        lastName: 'Okafor',
        matricNumber: '26/1/2/3/42',
      },
    ],
  })
  items!: RosterStudentResponseDto[];

  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Cursor for the next page, or null at the end.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  nextCursor!: string | null;
}

export class RosterClosureResponseDto {
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
    description: 'Offering whose roster is closed.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  offeringId!: string;

  @Expose()
  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Time the lecturer closed the roster.',
    example: '2026-11-10T10:30:00.000Z',
  })
  closedAt!: Date;
}

export class TeachingOfferingDto {
  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department-owned delivery of the course.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  offeringId!: string;

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
    description: 'Department that owns the record.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  departmentId!: string;

  @Expose()
  @ApiProperty({
    enum: ['opened', 'closed'],
    description: 'Current enrollment state of this offering.',
    example: 'opened',
  })
  registrationStatus!: 'opened' | 'closed';
}

export class TeachingOfferingsResponseDto {
  @Expose()
  @Type(() => TeachingOfferingDto)
  @ApiProperty({
    type: () => [TeachingOfferingDto],
    description: 'Offerings assigned to the signed-in lecturer.',
    example: [
      {
        offeringId: '0191e192-67ad-746b-9acb-c850234b408a',
        courseId: '0191e192-67ad-746b-9acb-c850234b408a',
        code: 'CSC101',
        name: 'Introduction to Computing',
        units: 3,
        semesterId: '0191e192-67ad-746b-9acb-c850234b408a',
        departmentId: '0191e192-67ad-746b-9acb-c850234b408a',
        registrationStatus: 'opened',
      },
    ],
  })
  offerings!: TeachingOfferingDto[];
}
