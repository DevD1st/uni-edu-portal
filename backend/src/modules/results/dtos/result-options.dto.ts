import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ResultReviewDepartmentDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Department whose results this administrator may review.',
    example: '0191e192-67ad-746b-9acb-c850234b408a',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    type: String,
    description:
      'Department name, including inactive departments with retained history.',
    example: 'Computer Science',
  })
  @Expose()
  name!: string;
}

export class ResultReviewOptionsDto {
  @ApiProperty({
    type: [ResultReviewDepartmentDto],
    description:
      'Departments covered by a review, approval, or reopening privilege. Includes inactive departments.',
    example: [
      { id: '0191e192-67ad-746b-9acb-c850234b408a', name: 'Computer Science' },
    ],
  })
  @Expose()
  @Type(() => ResultReviewDepartmentDto)
  departments!: ResultReviewDepartmentDto[];
}
