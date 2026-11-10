import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class AcademicLevelResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Academic level ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    enum: ['undergrad', 'postgrad', 'masters', 'doctorate'],
    description: 'University programme type.',
    example: 'undergrad',
  })
  @Expose()
  programType!: string;

  @ApiProperty({
    type: Number,
    description: 'Academic stage. Zero represents a graduate.',
    example: 1,
  })
  @Expose()
  stage!: number;

  @ApiProperty({
    type: String,
    description: 'Academic level shown to users.',
    example: '100 Level',
  })
  @Expose()
  displayName!: string;

  @ApiProperty({
    type: String,
    description: 'Label that distinguishes choices in a list.',
    example: '100 Level',
  })
  @Expose()
  selectionLabel!: string;

  @ApiProperty({
    type: Boolean,
    description: 'Whether this is the graduate stage.',
    example: false,
  })
  @Expose()
  isGraduate!: boolean;
}

export class FacultyResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Faculty ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    description: 'Faculty name.',
    example: 'Faculty of Science',
  })
  @Expose()
  name!: string;
}

export class DepartmentResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    description: 'Department name.',
    example: 'Computing',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the faculty that owns this department.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  facultyId!: string;
}

export class ProgrammeResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Programme ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID of the department offering this programme.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  departmentId!: string;

  @ApiProperty({
    enum: ['undergrad', 'postgrad', 'masters', 'doctorate'],
    description: 'University programme type.',
    example: 'undergrad',
  })
  @Expose()
  programType!: string;

  @ApiProperty({
    type: String,
    description: 'Programme name.',
    example: 'Computer Science',
  })
  @Expose()
  name!: string;
}

export class AcademicReferencesResponseDto {
  @ApiProperty({
    type: () => [AcademicLevelResponseDto],
    description: 'Available academic levels.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        programType: 'undergrad',
        stage: 1,
        displayName: '100 Level',
        selectionLabel: '100 Level',
        isGraduate: false,
      },
    ],
  })
  @Expose()
  @Type(() => AcademicLevelResponseDto)
  levels!: AcademicLevelResponseDto[];

  @ApiProperty({
    type: () => [FacultyResponseDto],
    description: 'Active faculties.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        name: 'Faculty of Science',
      },
    ],
  })
  @Expose()
  @Type(() => FacultyResponseDto)
  faculties!: FacultyResponseDto[];

  @ApiProperty({
    type: () => [DepartmentResponseDto],
    description: 'Active departments within active faculties.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        facultyId: '0191e192-67ad-746b-9acb-c850234b408a',
        name: 'Computing',
      },
    ],
  })
  @Expose()
  @Type(() => DepartmentResponseDto)
  departments!: DepartmentResponseDto[];

  @ApiProperty({
    type: () => [ProgrammeResponseDto],
    description: 'Active programmes within active departments.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        departmentId: '0191e192-67ad-746b-9acb-c850234b408a',
        programType: 'undergrad',
        name: 'Computer Science',
      },
    ],
  })
  @Expose()
  @Type(() => ProgrammeResponseDto)
  programmes!: ProgrammeResponseDto[];
}
