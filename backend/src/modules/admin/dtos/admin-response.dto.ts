import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PRIVILEGES } from '#shared/admin-authorization/privilege.js';

export class RoleResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Role ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    description: 'Unique role name.',
    example: 'lecturer',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Purpose of the role, when provided.',
    example: 'Teaches assigned courses.',
  })
  @Expose()
  description!: string | null;

  @ApiProperty({
    enum: ['custom', 'system'],
    description:
      'Whether the role is a protected system role or a custom role.',
    example: 'system',
  })
  @Expose()
  kind!: 'custom' | 'system';

  @ApiProperty({
    enum: ['super_admin', 'hod', 'lecturer'],
    nullable: true,
    description: 'Stable key for a system role. Null for custom roles.',
    example: 'lecturer',
  })
  @Expose()
  systemKey!: 'super_admin' | 'hod' | 'lecturer' | null;

  @ApiProperty({
    enum: PRIVILEGES,
    isArray: true,
    description: 'Permissions supplied by this role.',
    example: ['teach_course'],
  })
  @Expose()
  privileges!: string[];

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'ID of the admin who created the role, if known.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  createdByAdminId!: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'When the role was created.',
    example: '2026-11-10T10:30:00.000Z',
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'When the role was last changed.',
    example: '2026-11-10T10:30:00.000Z',
  })
  @Expose()
  updatedAt!: Date;
}

export class RolePageResponseDto {
  @ApiProperty({
    type: () => [RoleResponseDto],
    description: 'Roles on the current page.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        name: 'lecturer',
        description: 'Teaches assigned courses.',
        kind: 'system',
        systemKey: 'lecturer',
        createdByAdminId: null,
        privileges: ['teach_course'],
        createdAt: '2026-11-10T10:30:00.000Z',
        updatedAt: '2026-11-10T10:30:00.000Z',
      },
    ],
  })
  @Expose()
  @Type(() => RoleResponseDto)
  items!: RoleResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Cursor for the next page. Null means there are no more results.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  nextCursor!: string | null;
}

export class RoleAssignmentResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Role assignment ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Administrator who received the role.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  adminId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Assigned role ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  roleId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'Department where the role applies. Null means university-wide.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  departmentId!: string | null;

  @ApiProperty({
    type: String,
    description: 'Name of the assigned role.',
    example: 'lecturer',
  })
  @Expose()
  name!: string;
}

export class CreatedAdminResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'New administrator profile ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the administrator’s sign-in account.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  userId!: string;

  @ApiPropertyOptional({
    type: () => RoleAssignmentResponseDto,
    description: 'Initial role assignment, if requested.',
    example: {
      id: '0191e192-67ad-746b-9acb-c850234b408a',
      adminId: '0191e192-67ad-746b-9acb-c850234b408a',
      roleId: '0191e192-67ad-746b-9acb-c850234b408a',
      departmentId: '0191e192-67ad-746b-9acb-c850234b408a',
      name: 'lecturer',
    },
  })
  @Expose()
  @Type(() => RoleAssignmentResponseDto)
  grant?: RoleAssignmentResponseDto;
}

export class AdminDirectoryUserResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Sign-in account ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    format: 'email',
    description: 'Email used to sign in.',
    example: 'ada.okafor@example.test',
  })
  @Expose()
  email!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Given name, if provided.',
    example: 'Ada',
  })
  @Expose()
  firstName!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Family name, if provided.',
    example: 'Okafor',
  })
  @Expose()
  lastName!: string | null;

  @ApiProperty({
    enum: ['active', 'suspended'],
    description: 'Whether the account can sign in.',
    example: 'active',
  })
  @Expose()
  status!: 'active' | 'suspended';
}

export class AdminDirectoryGrantResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Role assignment ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'Department where the role applies. Null means university-wide.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  departmentId!: string | null;

  @ApiProperty({
    type: () => RoleResponseDto,
    description: 'Role linked to the assignment.',
    example: {
      id: '0191e192-67ad-746b-9acb-c850234b408a',
      name: 'lecturer',
      description: 'Teaches assigned courses.',
      kind: 'system',
      systemKey: 'lecturer',
      createdByAdminId: null,
      privileges: ['teach_course'],
      createdAt: '2026-11-10T10:30:00.000Z',
      updatedAt: '2026-11-10T10:30:00.000Z',
    },
  })
  @Expose()
  @Type(() => RoleResponseDto)
  role!: RoleResponseDto;
}

export class AdminResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Administrator profile ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the administrator’s sign-in account.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  userId!: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'When the administrator profile was created.',
    example: '2026-11-10T10:30:00.000Z',
  })
  @Expose()
  createdAt!: Date;

  @ApiPropertyOptional({
    type: () => AdminDirectoryUserResponseDto,
    description: 'Sign-in account, when requested and authorized.',
    example: {
      id: '0191e192-67ad-746b-9acb-c850234b408a',
      email: 'ada.okafor@example.test',
      firstName: 'Ada',
      lastName: 'Okafor',
      status: 'active',
    },
  })
  @Expose()
  @Type(() => AdminDirectoryUserResponseDto)
  user?: AdminDirectoryUserResponseDto;

  @Expose()
  @ApiPropertyOptional({
    type: Boolean,
    description:
      'Whether the signed-in administrator may edit this staff member’s names. Returned with the user profile.',
    example: true,
  })
  canUpdateProfile?: boolean;

  @ApiPropertyOptional({
    type: () => [AdminDirectoryGrantResponseDto],
    description: 'Visible role assignments, when requested.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        departmentId: '0191e192-67ad-746b-9acb-c850234b408a',
        role: {
          id: '0191e192-67ad-746b-9acb-c850234b408a',
          name: 'lecturer',
          description: 'Teaches assigned courses.',
          kind: 'system',
          systemKey: 'lecturer',
          createdByAdminId: null,
          privileges: ['teach_course'],
          createdAt: '2026-11-10T10:30:00.000Z',
          updatedAt: '2026-11-10T10:30:00.000Z',
        },
      },
    ],
  })
  @Expose()
  @Type(() => AdminDirectoryGrantResponseDto)
  roles?: AdminDirectoryGrantResponseDto[];
}

export class AdminPageResponseDto {
  @ApiProperty({
    type: () => [AdminResponseDto],
    description: 'Administrator profiles on the current page.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        userId: '0191e192-67ad-746b-9acb-c850234b408a',
        createdAt: '2026-11-10T10:30:00.000Z',
      },
    ],
  })
  @Expose()
  @Type(() => AdminResponseDto)
  items!: AdminResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Cursor for the next page. Null means there are no more results.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  nextCursor!: string | null;
}

export class AdminAuthorizationGrantResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Role assignment ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Assigned role ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  roleId!: string;

  @ApiProperty({
    type: String,
    description: 'Name of the assigned role.',
    example: 'lecturer',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    enum: ['super_admin', 'hod', 'lecturer'],
    nullable: true,
    description: 'Stable key for a system role. Null for custom roles.',
    example: 'lecturer',
  })
  @Expose()
  systemKey!: 'super_admin' | 'hod' | 'lecturer' | null;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'Department where the privileges apply. Null means university-wide.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  departmentId!: string | null;

  @ApiProperty({
    enum: PRIVILEGES,
    isArray: true,
    description: 'Permissions supplied by this role.',
    example: ['teach_course'],
  })
  @Expose()
  privileges!: string[];
}

export class AdminAuthorizationResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Signed-in administrator profile ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  adminId!: string;

  @ApiProperty({
    type: () => [AdminAuthorizationGrantResponseDto],
    description: 'The administrator’s current role assignments and scopes.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        roleId: '0191e192-67ad-746b-9acb-c850234b408a',
        name: 'lecturer',
        systemKey: 'lecturer',
        departmentId: '0191e192-67ad-746b-9acb-c850234b408a',
        privileges: ['teach_course'],
      },
    ],
  })
  @Expose()
  @Type(() => AdminAuthorizationGrantResponseDto)
  grants!: AdminAuthorizationGrantResponseDto[];
}

export class AuditEventResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Audit event ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    description: 'Action the administrator attempted.',
    example: 'user.set_status',
  })
  @Expose()
  action!: string;

  @ApiProperty({
    enum: ['access', 'users', 'academic', 'results', 'operations'],
    description: 'Group used to filter events.',
    example: 'users',
  })
  @Expose()
  category!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'ID of the account that made the request, when known.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  actorUserId!: string | null;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description:
      'ID of the administrator profile that made the request, when known.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  actorAdminId!: string | null;

  @ApiProperty({
    type: String,
    description: 'Kind of resource affected.',
    example: 'user',
  })
  @Expose()
  targetType!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'ID of the affected resource, when known.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  targetId!: string | null;

  @ApiProperty({
    enum: ['succeeded', 'failed', 'denied'],
    description: 'Result of the attempt.',
    example: 'succeeded',
  })
  @Expose()
  outcome!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Short reason code, if recorded.',
    example: 'forbidden',
  })
  @Expose()
  reason!: string | null;

  @ApiProperty({
    type: Object,
    nullable: true,
    description: 'Safe changes recorded for the action.',
    example: { status: 'suspended' },
  })
  @Expose()
  changes!: Record<string, unknown> | null;

  @ApiProperty({
    type: Object,
    nullable: true,
    description: 'Additional safe context, when recorded.',
    example: { departmentId: '0191e192-67ad-746b-9acb-c850234b408a' },
  })
  @Expose()
  metadata!: Record<string, unknown> | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'ID used to find the associated request in logs.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  requestId!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'ID used to find the associated trace.',
    example: '5e45e09177a37c66e0860a404f3a191f',
  })
  @Expose()
  traceId!: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'When the attempt occurred.',
    example: '2026-11-10T10:30:00.000Z',
  })
  @Expose()
  occurredAt!: Date;
}

export class AuditEventPageResponseDto {
  @ApiProperty({
    type: () => [AuditEventResponseDto],
    description: 'Audit events on the current page.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        action: 'user.set_status',
        category: 'users',
        actorUserId: '0191e192-67ad-746b-9acb-c850234b408a',
        actorAdminId: '0191e192-67ad-746b-9acb-c850234b408a',
        targetType: 'user',
        targetId: '0191e192-67ad-746b-9acb-c850234b408a',
        outcome: 'succeeded',
        reason: null,
        changes: { status: 'suspended' },
        metadata: null,
        requestId: '0191e192-67ad-746b-9acb-c850234b408a',
        traceId: null,
        occurredAt: '2026-11-10T10:30:00.000Z',
      },
    ],
  })
  @Expose()
  @Type(() => AuditEventResponseDto)
  items!: AuditEventResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Cursor for the next page. Null means there are no more results.',
    example:
      'MjAyNi0xMS0xMFQxMDozMDowMC4wMDAwMDBaLzAxOTFlMTkyLTY3YWQtNzQ2Yi05YWNiLWM4NTAyMzRiNDA4YQ',
  })
  @Expose()
  nextCursor!: string | null;
}
