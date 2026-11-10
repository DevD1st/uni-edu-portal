import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { normalizeUuidInput } from '#shared/http/uuid-input.js';

export class AcademicReportQueryDto {
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Select a valid semester for this report.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Semester whose registrations and results are counted.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  semesterId!: string;

  @IsOptional()
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Select a valid department for this report.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description:
      'Department to report on. Omit only with university-wide reporting access.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  departmentId?: string;
}

export class CourseReportQueryDto extends AcademicReportQueryDto {
  @IsOptional()
  @Transform(normalizeUuidInput)
  @IsUUID('all', {
    message: 'Use the cursor returned by the previous report page.',
  })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description:
      'The previous page’s nextCursor. Keep the same semester and department filters.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  cursor?: string;

  @Type(() => Number)
  @IsInt({ message: 'Page size must be a whole number.' })
  @Min(1, { message: 'Page size must be at least 1.' })
  @Max(100, { message: 'Page size must be 100 or fewer.' })
  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    maximum: 100,
    default: 25,
    description: 'Maximum course offerings to return on this page.',
    example: 25,
  })
  limit = 25;
}

export class PublishedPerformanceDto {
  @ApiProperty({
    type: Number,
    description:
      'Course enrollments, including those with unpublished results.',
    example: 120,
  })
  @Expose()
  enrollmentCount!: number;

  @ApiProperty({
    type: Number,
    description: 'Enrollments whose grade is currently approved.',
    example: 100,
  })
  @Expose()
  publishedCount!: number;

  @ApiProperty({
    type: Number,
    description: 'Approved enrollments with a grade other than F.',
    example: 85,
  })
  @Expose()
  passedCount!: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    description:
      'Mean total mark out of 100 across approved enrollments only, or null when none are approved.',
    example: 67.42,
  })
  @Expose()
  averageScore!: number | null;
}

export class AcademicOverviewDto extends PublishedPerformanceDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Semester covered by this report.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  semesterId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'Department covered by the report, or null for the whole university.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  departmentId!: string | null;

  @ApiProperty({
    type: Number,
    description:
      'Distinct students with an enrollment in this semester and scope.',
    example: 65,
  })
  @Expose()
  studentCount!: number;

  @ApiProperty({
    type: Number,
    description:
      'Configured offerings, including inactive and empty offerings.',
    example: 18,
  })
  @Expose()
  offeringCount!: number;

  @ApiProperty({
    type: Number,
    description: 'Offerings currently marked active.',
    example: 16,
  })
  @Expose()
  activeOfferingCount!: number;

  @ApiProperty({
    type: Number,
    description: 'Offering rosters whose registration is permanently closed.',
    example: 14,
  })
  @Expose()
  closedRosterCount!: number;

  @ApiProperty({
    type: Number,
    description: 'Result groups currently being drafted.',
    example: 3,
  })
  @Expose()
  pendingCount!: number;

  @ApiProperty({
    type: Number,
    description: 'Result groups awaiting a decision.',
    example: 2,
  })
  @Expose()
  submittedCount!: number;

  @ApiProperty({
    type: Number,
    description: 'Result groups returned to the lecturer for correction.',
    example: 1,
  })
  @Expose()
  correctionRequestedCount!: number;

  @ApiProperty({
    type: Number,
    description: 'Result groups that are currently approved.',
    example: 8,
  })
  @Expose()
  approvedCount!: number;
}

export class CoursePerformanceDto extends PublishedPerformanceDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description:
      'Course offering ID. Distinct departments have distinct offerings.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  offeringId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department that owns this offering.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  departmentId!: string;

  @ApiProperty({
    type: String,
    description: 'Name of the department that owns the offering.',
    example: 'Computing',
  })
  @Expose()
  department!: string;

  @ApiProperty({
    type: String,
    description: 'University catalog course code.',
    example: 'CSC101',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    type: String,
    description: 'University catalog course title.',
    example: 'Introduction to Computing',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    type: String,
    description: 'Display name of the study level for this offering.',
    example: '100 Level',
  })
  @Expose()
  academicLevel!: string;

  @ApiProperty({
    enum: ['active', 'inactive'],
    description: 'Whether this delivery is active.',
    example: 'active',
  })
  @Expose()
  offeringStatus!: 'active' | 'inactive';

  @ApiProperty({
    enum: ['opened', 'closed'],
    nullable: true,
    description:
      'Roster registration state, or null if no roster has been created.',
    example: 'closed',
  })
  @Expose()
  registrationStatus!: 'opened' | 'closed' | null;

  @ApiProperty({
    enum: ['pending', 'submitted', 'correction_requested', 'approved'],
    nullable: true,
    description:
      'Current result group state, or null if no group has been created.',
    example: 'approved',
  })
  @Expose()
  resultStatus!:
    | 'pending'
    | 'submitted'
    | 'correction_requested'
    | 'approved'
    | null;
}

export class CoursePerformancePageDto {
  @ApiProperty({
    type: () => [CoursePerformanceDto],
    description:
      'Course offering performance for the selected scope, ordered by offering ID.',
    example: [
      {
        offeringId: '0191e192-67ad-746b-9acb-c850234b408a',
        departmentId: '0191e192-67ad-746b-9acb-c850234b408a',
        department: 'Computing',
        code: 'CSC101',
        name: 'Introduction to Computing',
        academicLevel: '100 Level',
        offeringStatus: 'active',
        registrationStatus: 'closed',
        resultStatus: 'approved',
        enrollmentCount: 30,
        publishedCount: 30,
        passedCount: 25,
        averageScore: 67.42,
      },
    ],
  })
  @Expose()
  @Type(() => CoursePerformanceDto)
  items!: CoursePerformanceDto[];

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'Cursor to send on the next request, or null on the last page.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  nextCursor!: string | null;
}
