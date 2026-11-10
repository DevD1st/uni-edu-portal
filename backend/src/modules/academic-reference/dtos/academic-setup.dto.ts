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

export class FacultyWriteDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Enter a name as text.' })
  @Length(1, 160, {
    message: 'Name must contain between 1 and 160 characters.',
  })
  @ApiProperty({
    type: String,
    description: 'Faculty name.',
    example: 'Faculty of Science',
  })
  name!: string;

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

export class FacultySetupResponseDto {
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
    description: 'Faculty name.',
    example: 'Faculty of Science',
  })
  name!: string;

  @Expose()
  @ApiProperty({
    enum: ['active', 'inactive'],
    description:
      'Whether this record can be used in current academic operations.',
    example: 'active',
  })
  status!: 'active' | 'inactive';

  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Semester currently open for the faculty, or null.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  currentSemesterId!: string | null;
}

export class DepartmentWriteDto {
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid faculty ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Faculty that owns the department.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  facultyId!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Enter a name as text.' })
  @Length(1, 160, {
    message: 'Name must contain between 1 and 160 characters.',
  })
  @ApiProperty({
    type: String,
    description: 'Department name.',
    example: 'Computing',
  })
  name!: string;

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

export class DepartmentSetupResponseDto {
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
    description: 'Faculty that owns the department.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  facultyId!: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Department name.',
    example: 'Computing',
  })
  name!: string;

  @Expose()
  @ApiProperty({
    enum: ['active', 'inactive'],
    description:
      'Whether this record can be used in current academic operations.',
    example: 'active',
  })
  status!: 'active' | 'inactive';
}

export class ProgrammeWriteDto {
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid department ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department that owns the record.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  departmentId!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Enter a name as text.' })
  @Length(1, 160, {
    message: 'Name must contain between 1 and 160 characters.',
  })
  @ApiProperty({
    type: String,
    description: 'Programme name.',
    example: 'BSc Computer Science',
  })
  name!: string;

  @IsIn(['undergrad', 'postgrad', 'masters', 'doctorate'], {
    message: 'Choose undergrad, postgrad, masters or doctorate.',
  })
  @ApiProperty({
    enum: ['undergrad', 'postgrad', 'masters', 'doctorate'],
    description: 'University programme family.',
    example: 'undergrad',
  })
  programType!: 'undergrad' | 'postgrad' | 'masters' | 'doctorate';

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

export class ProgrammeSetupResponseDto {
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
    description: 'Department that owns the record.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  departmentId!: string;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Programme name.',
    example: 'BSc Computer Science',
  })
  name!: string;

  @Expose()
  @ApiProperty({
    enum: ['undergrad', 'postgrad', 'masters', 'doctorate'],
    description: 'University programme family.',
    example: 'undergrad',
  })
  programType!: 'undergrad' | 'postgrad' | 'masters' | 'doctorate';

  @Expose()
  @ApiProperty({
    enum: ['active', 'inactive'],
    description:
      'Whether this record can be used in current academic operations.',
    example: 'active',
  })
  status!: 'active' | 'inactive';
}

export class SessionWriteDto {
  @IsInt({ message: 'First year of the session must be a whole number.' })
  @Min(1000, { message: 'The first year must be at least 1000.' })
  @Max(9999, { message: 'The first year must be at most 9999.' })
  @ApiProperty({
    type: Number,
    minimum: 1000,
    maximum: 9999,
    description: 'First year of the session.',
    example: 2026,
  })
  startYear!: number;

  @IsInt({ message: 'Last year of the session must be a whole number.' })
  @Min(1000, { message: 'The final year must be at least 1000.' })
  @Max(9999, { message: 'The final year must be at most 9999.' })
  @ApiProperty({
    type: Number,
    minimum: 1000,
    maximum: 9999,
    description: 'Last year of the session.',
    example: 2027,
  })
  endYear!: number;

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

export class SessionSetupResponseDto {
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
    type: Number,
    minimum: 1000,
    maximum: 9999,
    description: 'First year of the session.',
    example: 2026,
  })
  startYear!: number;

  @Expose()
  @ApiProperty({
    type: Number,
    minimum: 1000,
    maximum: 9999,
    description: 'Last year of the session.',
    example: 2027,
  })
  endYear!: number;

  @Expose()
  @ApiProperty({
    enum: ['active', 'inactive'],
    description:
      'Whether this record can be used in current academic operations.',
    example: 'active',
  })
  status!: 'active' | 'inactive';
}

export class SemesterWriteDto {
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid academic session ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Academic session that contains this semester.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  academicSessionId!: string;

  @IsInt({
    message:
      'Sequence of the term in the academic session must be a whole number.',
  })
  @Min(1, { message: 'The semester number must be at least 1.' })
  @Max(32767, { message: 'The semester number must be at most 32767.' })
  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 32767,
    description: 'Sequence of the term in the academic session.',
    example: 1,
  })
  termNumber!: number;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Enter a name as text.' })
  @Length(1, 160, {
    message: 'Name must contain between 1 and 160 characters.',
  })
  @ApiProperty({
    type: String,
    description: 'Semester name.',
    example: 'First Semester',
  })
  name!: string;

  @IsInt({
    message:
      'Maximum total credit units a student can register in the semester must be a whole number.',
  })
  @Min(1, { message: 'The credit limit must be at least 1.' })
  @Max(32767, { message: 'The credit limit must be at most 32767.' })
  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 32767,
    description:
      'Maximum total credit units a student can register in the semester.',
    example: 24,
  })
  maxUnits!: number;

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

export class SemesterSetupResponseDto {
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
    description: 'Academic session that contains this semester.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  academicSessionId!: string;

  @Expose()
  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 32767,
    description: 'Sequence of the term in the academic session.',
    example: 1,
  })
  termNumber!: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Semester name.',
    example: 'First Semester',
  })
  name!: string;

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
    enum: ['active', 'inactive'],
    description:
      'Whether this record can be used in current academic operations.',
    example: 'active',
  })
  status!: 'active' | 'inactive';
}

export class SetCurrentSemesterDto {
  @ValidateIf((_object, value: unknown) => value !== null)
  @Transform(normalizeUuidInput)
  @IsUUID('all', { message: 'Enter a valid semester ID.' })
  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Semester used for course registration.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  semesterId!: string | null;
}

export class SetAcademicLevelStatusDto {
  @Expose()
  @IsIn(['active', 'inactive'], {
    message: 'Choose active or inactive for the academic level.',
  })
  @ApiProperty({
    enum: ['active', 'inactive'],
    description:
      'Whether the level can be used in new placements and registration.',
    example: 'active',
  })
  status!: 'active' | 'inactive';
}

export class AcademicLevelSetupDto extends SetAcademicLevelStatusDto {
  @Expose()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Academic level ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  id!: string;

  @Expose()
  @ApiProperty({
    enum: ['undergrad', 'postgrad', 'masters', 'doctorate'],
    description: 'University programme family associated with the level.',
    example: 'undergrad',
  })
  programType!: 'undergrad' | 'postgrad' | 'masters' | 'doctorate';

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Study stage. Zero represents the Graduate level.',
    example: 1,
  })
  stage!: number;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'The university’s fixed display label for the level.',
    example: '100 Level',
  })
  displayName!: string;
}

export class AcademicSetupResponseDto {
  @Expose()
  @Type(() => AcademicLevelSetupDto)
  @ApiProperty({
    type: () => [AcademicLevelSetupDto],
    description: 'Shared academic levels, including inactive levels.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        programType: 'undergrad',
        stage: 1,
        displayName: '100 Level',
        status: 'active',
      },
    ],
  })
  levels!: AcademicLevelSetupDto[];

  @Expose()
  @Type(() => FacultySetupResponseDto)
  @ApiProperty({
    type: () => [FacultySetupResponseDto],
    description: 'Academic faculty records available to the administrator.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        name: 'Faculty of Science',
        status: 'active',
        currentSemesterId: '0191e192-67ad-746b-9acb-c850234b408a',
      },
    ],
  })
  faculties!: FacultySetupResponseDto[];

  @Expose()
  @Type(() => DepartmentSetupResponseDto)
  @ApiProperty({
    type: () => [DepartmentSetupResponseDto],
    description: 'Academic department records available to the administrator.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        facultyId: '0191e192-67ad-746b-9acb-c850234b408a',
        name: 'Computing',
        status: 'active',
      },
    ],
  })
  departments!: DepartmentSetupResponseDto[];

  @Expose()
  @Type(() => ProgrammeSetupResponseDto)
  @ApiProperty({
    type: () => [ProgrammeSetupResponseDto],
    description: 'Academic programme records available to the administrator.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        departmentId: '0191e192-67ad-746b-9acb-c850234b408a',
        name: 'BSc Computer Science',
        programType: 'undergrad',
        status: 'active',
      },
    ],
  })
  programmes!: ProgrammeSetupResponseDto[];

  @Expose()
  @Type(() => SessionSetupResponseDto)
  @ApiProperty({
    type: () => [SessionSetupResponseDto],
    description: 'Academic session records available to the administrator.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        startYear: 2026,
        endYear: 2027,
        status: 'active',
      },
    ],
  })
  sessions!: SessionSetupResponseDto[];

  @Expose()
  @Type(() => SemesterSetupResponseDto)
  @ApiProperty({
    type: () => [SemesterSetupResponseDto],
    description: 'Academic semester records available to the administrator.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        academicSessionId: '0191e192-67ad-746b-9acb-c850234b408a',
        termNumber: 1,
        name: 'First Semester',
        maxUnits: 24,
        status: 'active',
      },
    ],
  })
  semesters!: SemesterSetupResponseDto[];
}
