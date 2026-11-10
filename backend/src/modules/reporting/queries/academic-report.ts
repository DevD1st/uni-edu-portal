import { Query } from '@nestjs/cqrs';
import type {
  AcademicOverviewDto,
  AcademicReportQueryDto,
  CoursePerformancePageDto,
  CourseReportQueryDto,
} from '../dtos/academic-report.dto.js';

export class ReadAcademicOverviewQuery extends Query<AcademicOverviewDto> {
  constructor(
    readonly actorId: string,
    readonly input: AcademicReportQueryDto,
  ) {
    super();
  }
}

export class ListCoursePerformanceQuery extends Query<CoursePerformancePageDto> {
  constructor(
    readonly actorId: string,
    readonly input: CourseReportQueryDto,
  ) {
    super();
  }
}
