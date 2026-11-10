import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { RESULT_REOPEN_REASONS } from '#shared/admin-authorization/audit.contracts.js';
import type { ResultReopenReason } from '#shared/admin-authorization/audit.contracts.js';
import { normalizeUuidInput } from '#shared/http/uuid-input.js';

export const RESULT_STATUSES = [
  'pending',
  'submitted',
  'approved',
  'correction_requested',
] as const;
export type ResultStatus = (typeof RESULT_STATUSES)[number];

export class ResultPageQueryDto {
  @IsOptional()
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Use a valid cursor from the previous page.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Cursor returned by the previous page.',
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
    description: 'Number of records to return.',
    example: 25,
  })
  limit = 25;
}

export class LecturerResultsQueryDto extends ResultPageQueryDto {
  @IsOptional()
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid semester ID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Filter results to this semester.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  semesterId?: string;

  @IsOptional()
  @IsIn(RESULT_STATUSES, {
    message: 'Choose pending, submitted, approved, or correction requested.',
  })
  @ApiPropertyOptional({
    enum: RESULT_STATUSES,
    description:
      'Filter groups by their current result state. Departmental review defaults to submitted.',
    example: 'submitted',
  })
  status?: ResultStatus;
}

export class DepartmentResultsQueryDto extends LecturerResultsQueryDto {
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid department ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department responsible for the results.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  departmentId!: string;
}

export class ResultMarkInputDto {
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Each mark must identify a valid enrollment ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Enrollment on this result group’s roster.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  enrollmentId!: string;

  @ValidateIf(
    (_object, value: unknown) => value !== undefined && value !== null,
  )
  @IsNumber({}, { message: 'Enter the CA mark as a number.' })
  @Min(0, { message: 'The CA mark must be zero or greater.' })
  @Max(100, { message: 'The CA mark must be 100 or less.' })
  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    minimum: 0,
    maximum: 100,
    multipleOf: 0.01,
    description:
      'CA mark within the offering’s policy limit. Omit to keep the existing value or send null to clear it.',
    example: 24.5,
  })
  caScore?: number | null;

  @ValidateIf(
    (_object, value: unknown) => value !== undefined && value !== null,
  )
  @IsNumber({}, { message: 'Enter the exam mark as a number.' })
  @Min(0, { message: 'The exam mark must be zero or greater.' })
  @Max(100, { message: 'The exam mark must be 100 or less.' })
  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    minimum: 0,
    maximum: 100,
    multipleOf: 0.01,
    description:
      'Exam mark within the offering’s policy limit. Omit to keep the existing value or send null to clear it.',
    example: 49.25,
  })
  examScore?: number | null;
}

export class SaveResultMarksDto {
  @IsArray({ message: 'Send the enrollment marks as a list.' })
  @ArrayNotEmpty({ message: 'Enter marks for at least one enrollment.' })
  @ArrayMaxSize(100, {
    message: 'Save marks for up to 100 enrollments at a time.',
  })
  @IsObject({
    each: true,
    message:
      'Each mark entry must be an object with an enrollment ID and marks.',
  })
  @ValidateNested({
    each: true,
    message: 'Check the enrollment ID and marks in each entry.',
  })
  @Type(() => ResultMarkInputDto)
  @ApiProperty({
    type: () => [ResultMarkInputDto],
    minItems: 1,
    maxItems: 100,
    description:
      'Enrollment marks to save together. Each enrollment can appear once.',
    example: [
      {
        enrollmentId: '0191e192-67ad-746b-9acb-c850234b408a',
        caScore: 24.5,
        examScore: 49.25,
      },
    ],
  })
  marks!: ResultMarkInputDto[];
}

function trimText({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class ResultDecisionNoteDto {
  @IsOptional()
  @Transform(trimText)
  @IsString({ message: 'Enter the note as text.' })
  @Length(1, 1000, {
    message: 'A note must contain between 1 and 1,000 characters.',
  })
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    minLength: 1,
    maxLength: 1000,
    description: 'Optional staff note on the submission or approval.',
    example: 'Marks verified against the course records.',
  })
  note?: string | null;
}

export class RequestResultCorrectionsDto {
  @Transform(trimText)
  @IsString({ message: 'Explain the corrections the lecturer needs to make.' })
  @Length(1, 1000, {
    message: 'Correction feedback must contain between 1 and 1,000 characters.',
  })
  @ApiProperty({
    type: String,
    minLength: 1,
    maxLength: 1000,
    description: 'Feedback the lecturer sees before resubmitting.',
    example: 'Check the exam marks against the attendance sheet.',
  })
  reason!: string;
}

export class ReopenResultDto {
  @IsIn(RESULT_REOPEN_REASONS, {
    message: 'Choose mark correction, review error, or administrative request.',
  })
  @ApiProperty({
    enum: RESULT_REOPEN_REASONS,
    description:
      'Reason code retained in the audit trail when a result is reopened.',
    example: 'mark_correction',
  })
  reason!: ResultReopenReason;
}
