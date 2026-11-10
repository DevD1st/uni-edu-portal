import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ListCoursePerformanceQuery } from '../../academic-report.js';
import { AcademicReportingService } from '../../../services/academic-reporting.service.js';

@QueryHandler(ListCoursePerformanceQuery)
export class ListCoursePerformanceHandler
  implements IQueryHandler<ListCoursePerformanceQuery>
{
  constructor(private readonly reports: AcademicReportingService) {}

  execute(query: ListCoursePerformanceQuery) {
    return this.reports.courses(query.actorId, query.input);
  }
}
