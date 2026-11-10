import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class StudentResultTermDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Student’s saved semester record ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Academic semester ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  semesterId!: string;

  @ApiProperty({
    type: String,
    description: 'Name of the semester.',
    example: 'First Semester',
  })
  @Expose()
  semesterName!: string;

  @ApiProperty({
    type: String,
    description: 'Academic session label.',
    example: '2026/2027',
  })
  @Expose()
  academicSession!: string;

  @ApiProperty({
    type: String,
    description: 'Department saved on the semester record.',
    example: 'Computing',
  })
  @Expose()
  department!: string;

  @ApiProperty({
    type: String,
    description: 'Programme saved on the semester record.',
    example: 'BSc Computer Science',
  })
  @Expose()
  programme!: string;

  @ApiProperty({
    type: String,
    description: 'Academic level saved on the semester record.',
    example: '100 Level',
  })
  @Expose()
  academicLevel!: string;

  @ApiProperty({
    type: Number,
    description:
      'Credit units of all currently approved courses in the semester.',
    example: 3,
  })
  @Expose()
  approvedUnits!: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Semester GPA, or null when no approved units exist.',
    example: 5,
  })
  @Expose()
  gpa!: number | null;
}

export class PublishedCourseResultDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Published course enrollment ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    description: 'University catalog course code.',
    example: 'CSC101',
  })
  @Expose()
  code!: string;

  @ApiProperty({
    type: String,
    description: 'Course title.',
    example: 'Introduction to Computing',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    type: Number,
    description: 'Credit units recorded at registration.',
    example: 3,
  })
  @Expose()
  units!: number;

  @ApiProperty({
    type: Number,
    description: 'Continuous assessment mark.',
    example: 24.5,
  })
  @Expose()
  caScore!: number;

  @ApiProperty({
    type: Number,
    description: 'Examination mark.',
    example: 49.25,
  })
  @Expose()
  examScore!: number;

  @ApiProperty({
    type: Number,
    description: 'Combined CA and examination mark.',
    example: 73.75,
  })
  @Expose()
  totalScore!: number;

  @ApiProperty({
    enum: ['A', 'B', 'C', 'D', 'E', 'F'],
    description: 'Letter grade on the offering’s grading scale.',
    example: 'A',
  })
  @Expose()
  grade!: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

  @ApiProperty({
    type: Number,
    description: 'Grade points per credit unit.',
    example: 5,
  })
  @Expose()
  gradePoint!: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Time of the approval that published this result.',
    example: '2026-11-10T10:30:00.000Z',
  })
  @Expose()
  approvedAt!: Date;
}

export class StudentResultHistoryDto {
  @ApiProperty({
    type: Number,
    nullable: true,
    description:
      'Credit-weighted GPA across all currently approved terms, or null without approved units.',
    example: 4.5,
  })
  @Expose()
  cgpa!: number | null;

  @ApiProperty({
    type: () => [StudentResultTermDto],
    description: 'Terms in the student’s academic history.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        semesterId: '0191e192-67ad-746b-9acb-c850234b408a',
        semesterName: 'First Semester',
        academicSession: '2026/2027',
        department: 'Computing',
        programme: 'BSc Computer Science',
        academicLevel: '100 Level',
        approvedUnits: 3,
        gpa: 5,
      },
    ],
  })
  @Expose()
  @Type(() => StudentResultTermDto)
  terms!: StudentResultTermDto[];
}

export class StudentResultStatementDto extends StudentResultTermDto {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Student’s given name, when available.',
    example: 'Ada',
  })
  @Expose()
  firstName!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Student’s family name, when available.',
    example: 'Okafor',
  })
  @Expose()
  lastName!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Student’s matriculation number, when available.',
    example: '26/1/2/3/42',
  })
  @Expose()
  matricNumber!: string | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    description:
      'Credit-weighted GPA across all currently approved terms, or null without approved units.',
    example: 4.5,
  })
  @Expose()
  cgpa!: number | null;

  @ApiProperty({
    type: () => [PublishedCourseResultDto],
    description:
      'Currently approved results belonging to this student and semester.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        code: 'CSC101',
        name: 'Introduction to Computing',
        units: 3,
        caScore: 24.5,
        examScore: 49.25,
        totalScore: 73.75,
        grade: 'A',
        gradePoint: 5,
        approvedAt: '2026-11-10T10:30:00.000Z',
      },
    ],
  })
  @Expose()
  @Type(() => PublishedCourseResultDto)
  courses!: PublishedCourseResultDto[];
}
