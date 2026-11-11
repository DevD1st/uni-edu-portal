import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class StudentProfileResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Student profile ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Issued matriculation number, when placement is complete.',
    example: '26/1/2/3/42',
  })
  @Expose()
  matricNumber!: string | null;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Current academic level ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  academicLevelId!: string | null;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Current programme ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  courseOfStudyId!: string | null;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Current department ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  departmentId!: string | null;

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Current faculty ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  facultyId!: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'Name of the assigned faculty, including an inactive faculty.',
    example: 'Faculty of Science',
  })
  @Expose()
  facultyName?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'Name of the assigned department, including an inactive department.',
    example: 'Computer Science',
  })
  @Expose()
  departmentName?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'Name of the assigned programme, including an inactive programme.',
    example: 'B.Sc. Computer Science',
  })
  @Expose()
  programmeName?: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'Display label of the assigned academic level, including an inactive level.',
    example: '100 Level',
  })
  @Expose()
  academicLevelDisplayName?: string | null;
}

export class UserAdminProfileResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Administrator profile ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;
}

export class UserResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Account ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    enum: ['student', 'admin'],
    description: 'The type of account.',
    example: 'student',
  })
  @Expose()
  role!: 'student' | 'admin';

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

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'When the account was created.',
    example: '2026-11-10T10:30:00.000Z',
  })
  @Expose()
  createdAt!: Date;

  @ApiPropertyOptional({
    type: () => StudentProfileResponseDto,
    description: 'Student profile, when included.',
    example: {
      id: '0191e192-67ad-746b-9acb-c850234b408a',
      matricNumber: '26/1/2/3/42',
      academicLevelId: '0191e192-67ad-746b-9acb-c850234b408a',
      courseOfStudyId: '0191e192-67ad-746b-9acb-c850234b408a',
      departmentId: '0191e192-67ad-746b-9acb-c850234b408a',
      facultyId: '0191e192-67ad-746b-9acb-c850234b408a',
      facultyName: 'Faculty of Science',
      departmentName: 'Computer Science',
      programmeName: 'B.Sc. Computer Science',
      academicLevelDisplayName: '100 Level',
    },
  })
  @Expose()
  @Type(() => StudentProfileResponseDto)
  student?: StudentProfileResponseDto;

  @ApiPropertyOptional({
    type: () => UserAdminProfileResponseDto,
    description: 'Administrator profile, when included.',
    example: { id: '0191e192-67ad-746b-9acb-c850234b408a' },
  })
  @Expose()
  @Type(() => UserAdminProfileResponseDto)
  admin?: UserAdminProfileResponseDto;
}

export class UserPageResponseDto {
  @ApiProperty({
    type: () => [UserResponseDto],
    description: 'Accounts on the current page.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        role: 'student',
        email: 'ada.okafor@example.test',
        firstName: 'Ada',
        lastName: 'Okafor',
        status: 'active',
        createdAt: '2026-11-10T10:30:00.000Z',
      },
    ],
  })
  @Expose()
  @Type(() => UserResponseDto)
  items!: UserResponseDto[];

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
