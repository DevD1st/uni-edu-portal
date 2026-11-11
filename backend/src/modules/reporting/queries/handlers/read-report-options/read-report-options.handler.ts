import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ReadReportOptionsQuery } from '../../academic-report.js';
import { AcademicReportingService } from '../../../services/academic-reporting.service.js';

@QueryHandler(ReadReportOptionsQuery)
export class ReadReportOptionsHandler implements IQueryHandler<ReadReportOptionsQuery> {
  constructor(private readonly reports: AcademicReportingService) {}

  execute(query: ReadReportOptionsQuery) {
    return this.reports.options(query.actorId);
  }
}
