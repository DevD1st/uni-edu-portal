import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ADMIN_AUDIT_ACTIONS } from '#shared/admin-authorization/audit.contracts.js';
import type {
  AuditAction,
  AuditOutcome,
} from '#shared/admin-authorization/audit.contracts.js';

export class ListAuditEventsDto {
  @Type(() => Number)
  @IsInt({ message: 'Page size must be a whole number.' })
  @Min(1, { message: 'Page size must be at least 1.' })
  @Max(100, { message: 'Page size must be 100 or fewer.' })
  @ApiPropertyOptional({
    type: Number,
    default: 25,
    minimum: 1,
    maximum: 100,
    description: 'Maximum number of results to return.',
    example: 25,
  })
  limit = 25;

  @IsOptional()
  @IsString({ message: 'Audit cursor must be text.' })
  @MaxLength(180, { message: 'Audit cursor must be 180 characters or fewer.' })
  @ApiPropertyOptional({
    type: String,
    description: 'Opaque cursor returned by the previous page.',
    example:
      'MjAyNi0xMS0xMFQxMDozMDowMC4wMDAwMDBaLzAxOTFlMTkyLTY3YWQtNzQ2Yi05YWNiLWM4NTAyMzRiNDA4YQ',
  })
  cursor?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Administrator ID must be a valid UUID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Only include events from this administrator profile.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  actorAdminId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'Account ID must be a valid UUID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Only include events from this sign-in account.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  actorUserId?: string;

  @IsOptional()
  @IsIn(Object.keys(ADMIN_AUDIT_ACTIONS), {
    message: 'Choose an audit action listed in the API documentation.',
  })
  @ApiPropertyOptional({
    enum: Object.keys(ADMIN_AUDIT_ACTIONS),
    description: 'Only include this audit action.',
    example: 'user.set_status',
  })
  action?: AuditAction;

  @IsOptional()
  @IsIn(['access', 'users', 'academic', 'results', 'operations'], {
    message: 'Choose access, users, academic, results, or operations.',
  })
  @ApiPropertyOptional({
    enum: ['access', 'users', 'academic', 'results', 'operations'],
    description: 'Only include events in this audit category.',
    example: 'users',
  })
  category?: string;

  @IsOptional()
  @IsIn(['succeeded', 'failed', 'denied'], {
    message: 'Choose succeeded, failed, or denied.',
  })
  @ApiPropertyOptional({
    enum: ['succeeded', 'denied', 'failed'],
    description: 'Only include events with this outcome.',
    example: 'succeeded',
  })
  outcome?: AuditOutcome;

  @IsOptional()
  @IsUUID('all', { message: 'Target ID must be a valid UUID.' })
  @ApiPropertyOptional({
    type: String,
    format: 'uuid',
    description: 'Only include events for this resource ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  targetId?: string;

  @IsOptional()
  @IsISO8601(
    { strict: true },
    {
      message:
        'Start date must use ISO 8601 format, such as 2026-11-10T10:30:00Z.',
    },
  )
  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Earliest timestamp to include, in ISO 8601 format.',
    example: '2026-11-10T10:30:00.000Z',
  })
  from?: string;

  @IsOptional()
  @IsISO8601(
    { strict: true },
    {
      message:
        'End date must use ISO 8601 format, such as 2026-11-10T10:30:00Z.',
    },
  )
  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Latest timestamp to include, in ISO 8601 format.',
    example: '2026-11-11T00:00:00.000Z',
  })
  to?: string;
}
