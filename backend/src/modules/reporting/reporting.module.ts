import { Module } from '@nestjs/common';
import { AcademicReportingController } from './controllers/academic-reporting.controller.js';
import { ListCoursePerformanceHandler } from './queries/handlers/list-course-performance/list-course-performance.handler.js';
import { ReadAcademicOverviewHandler } from './queries/handlers/read-academic-overview/read-academic-overview.handler.js';
import { AcademicReportingService } from './services/academic-reporting.service.js';

@Module({
  controllers: [AcademicReportingController],
  providers: [
    AcademicReportingService,
    ListCoursePerformanceHandler,
    ReadAcademicOverviewHandler,
  ],
})
export class ReportingModule {}
