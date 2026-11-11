import { Query } from '@nestjs/cqrs';
import type {
  AcademicOverviewDto,
  AcademicReportOptionsDto,
  AcademicReportQueryDto,
  CoursePerformancePageDto,
  CourseReportQueryDto,
} from '../dtos/academic-report.dto.js';

export class ReadReportOptionsQuery extends Query<AcademicReportOptionsDto> {
  constructor(readonly actorId: string) {
    super();
  }
}

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
