import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ReadAcademicOverviewQuery } from '../../academic-report.js';
import { AcademicReportingService } from '../../../services/academic-reporting.service.js';

@QueryHandler(ReadAcademicOverviewQuery)
export class ReadAcademicOverviewHandler
  implements IQueryHandler<ReadAcademicOverviewQuery>
{
  constructor(private readonly reports: AcademicReportingService) {}

  execute(query: ReadAcademicOverviewQuery) {
    return this.reports.overview(query.actorId, query.input);
  }
}
