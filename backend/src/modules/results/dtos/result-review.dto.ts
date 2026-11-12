import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ResultGroupSummaryDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Result group ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department-owned course offering ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  offeringId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department responsible for these results.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  departmentId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Semester of this course offering.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  semesterId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Administrator assigned to teach this offering.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  lecturerId!: string;

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
    enum: ['pending', 'submitted', 'correction_requested', 'approved'],
    description: 'Current result review state.',
    example: 'submitted',
  })
  @Expose()
  status!: 'pending' | 'submitted' | 'correction_requested' | 'approved';

  @ApiProperty({
    enum: ['opened', 'closed'],
    description: 'Whether the roster accepts enrollment.',
    example: 'closed',
  })
  @Expose()
  registrationStatus!: 'opened' | 'closed';

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Time of the latest submission, when available.',
    example: '2026-11-10T10:30:00.000Z',
  })
  @Expose()
  submittedAt!: Date | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Time of the latest approval, when available.',
    example: '2026-11-10T10:30:00.000Z',
  })
  @Expose()
  approvedAt!: Date | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Time of the latest request for corrections.',
    example: '2026-11-10T10:30:00.000Z',
  })
  @Expose()
  correctionRequestedAt!: Date | null;

  @ApiProperty({
    type: Number,
    description: 'Maximum CA mark under the offering’s grading policy.',
    example: 30,
  })
  @Expose()
  maxCaScore!: number;

  @ApiProperty({
    type: Number,
    description: 'Maximum exam mark under the offering’s grading policy.',
    example: 70,
  })
  @Expose()
  maxExamScore!: number;

  @ApiProperty({
    type: Number,
    description: 'Number of students registered in the roster.',
    example: 26,
  })
  @Expose()
  enrolledCount!: number;

  @ApiProperty({
    type: Number,
    description: 'Number of enrollments with both marks entered.',
    example: 26,
  })
  @Expose()
  markedCount!: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Mean total for enrollments with both marks, when available.',
    example: 73.5,
  })
  @Expose()
  averageScore!: number | null;
}

export class ResultGroupPageDto {
  @ApiProperty({
    type: () => [ResultGroupSummaryDto],
    description: 'Result groups visible in this role and scope.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        offeringId: '0191e192-67ad-746b-9acb-c850234b408a',
        departmentId: '0191e192-67ad-746b-9acb-c850234b408a',
        semesterId: '0191e192-67ad-746b-9acb-c850234b408a',
        lecturerId: '0191e192-67ad-746b-9acb-c850234b408a',
        code: 'CSC101',
        name: 'Introduction to Computing',
        status: 'submitted',
        registrationStatus: 'closed',
        submittedAt: '2026-11-10T10:30:00.000Z',
        approvedAt: '2026-11-10T10:30:00.000Z',
        correctionRequestedAt: '2026-11-10T10:30:00.000Z',
        maxCaScore: 30,
        maxExamScore: 70,
        enrolledCount: 26,
        markedCount: 26,
        averageScore: 73.5,
      },
    ],
  })
  @Expose()
  @Type(() => ResultGroupSummaryDto)
  items!: ResultGroupSummaryDto[];

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Cursor for the next page, or null at the end.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  nextCursor!: string | null;
}

export class ResultMarkResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Enrollment ID used to save marks.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Internal student profile ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  studentId!: string;

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
    description: 'Continuous assessment mark.',
    example: 24.5,
  })
  @Expose()
  caScore!: number | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Examination mark.',
    example: 49.25,
  })
  @Expose()
  examScore!: number | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Combined CA and examination mark.',
    example: 73.75,
  })
  @Expose()
  totalScore!: number | null;

  @ApiProperty({
    enum: ['A', 'B', 'C', 'D', 'E', 'F'],
    nullable: true,
    description: 'Letter grade on the offering’s grading scale.',
    example: 'A',
  })
  @Expose()
  grade!: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Grade points per credit unit.',
    example: 5,
  })
  @Expose()
  gradePoint!: number | null;
}

export class ResultGroupDetailDto extends ResultGroupSummaryDto {
  @ApiProperty({
    type: Boolean,
    description:
      'Whether this viewer can approve the submitted group. Teaching, submission or marks authorship prevents self-approval unless the viewer has the protected university-wide Super Admin role; approval privilege in the owning department is still required.',
    example: false,
  })
  @Expose()
  canApprove!: boolean;

  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'Public explanation when approval is unavailable to this viewer; null when approval is permitted.',
    example:
      'You cannot approve results you taught, submitted, or entered marks for. Ask another authorized reviewer or a Super Admin to approve them.',
  })
  @Expose()
  approvalBlockedReason!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Optional note on the latest submission.',
    example: 'All marks checked.',
  })
  @Expose()
  submissionReason!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Optional note on the latest approval.',
    example: 'Department review completed.',
  })
  @Expose()
  approvalReason!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Feedback from the latest request for corrections.',
    example: 'Check the exam marks against the attendance sheet.',
  })
  @Expose()
  correctionRequestReason!: string | null;

  @ApiProperty({
    type: () => [ResultMarkResponseDto],
    description: 'Paged enrollment marks and grade previews.',
    example: [
      {
        id: '0191e192-67ad-746b-9acb-c850234b408a',
        studentId: '0191e192-67ad-746b-9acb-c850234b408a',
        firstName: 'Ada',
        lastName: 'Okafor',
        matricNumber: '26/1/2/3/42',
        caScore: 24.5,
        examScore: 49.25,
        totalScore: 73.75,
        grade: 'A',
        gradePoint: 5,
      },
    ],
  })
  @Expose()
  @Type(() => ResultMarkResponseDto)
  marks!: ResultMarkResponseDto[];

  @ApiProperty({
    type: String,
    format: 'uuid',
    nullable: true,
    description: 'Cursor for the next page, or null at the end.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  nextCursor!: string | null;
}

export class ResultStateResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Result group ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department-owned course offering ID.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  offeringId!: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department responsible for these results.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  departmentId!: string;

  @ApiProperty({
    enum: ['pending', 'submitted', 'correction_requested', 'approved'],
    description: 'Current result review state.',
    example: 'submitted',
  })
  @Expose()
  status!: 'pending' | 'submitted' | 'correction_requested' | 'approved';

  @ApiProperty({
    enum: ['opened', 'closed'],
    description: 'Whether the roster accepts enrollment.',
    example: 'closed',
  })
  @Expose()
  registrationStatus!: 'opened' | 'closed';

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Time of the latest submission, when available.',
    example: '2026-11-10T10:30:00.000Z',
  })
  @Expose()
  submittedAt!: Date | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Time of the latest approval, when available.',
    example: '2026-11-10T10:30:00.000Z',
  })
  @Expose()
  approvedAt!: Date | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Time of the latest request for corrections.',
    example: '2026-11-10T10:30:00.000Z',
  })
  @Expose()
  correctionRequestedAt!: Date | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Optional note on the latest submission.',
    example: 'All marks checked.',
  })
  @Expose()
  submissionReason!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Optional note on the latest approval.',
    example: 'Department review completed.',
  })
  @Expose()
  approvalReason!: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Feedback from the latest request for corrections.',
    example: 'Check the exam marks against the attendance sheet.',
  })
  @Expose()
  correctionRequestReason!: string | null;
}

export class SaveMarksResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Result group whose marks were saved.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: Number,
    description: 'Number of enrollments whose marks changed.',
    example: 2,
  })
  @Expose()
  changedCount!: number;
}
