import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultGroup } from './entity/result-groups.entity.js';
import { ResultAccessService } from './services/result-access.service.js';
import { ResultWorkflowService } from './services/result-workflow.service.js';
import { ResultReviewService } from './services/result-review.service.js';
import { StudentResultsService } from './services/student-results.service.js';
import { SaveResultMarksHandler } from './commands/handlers/save-result-marks/save-result-marks.handler.js';
import { SubmitResultsHandler } from './commands/handlers/submit-results/submit-results.handler.js';
import { ApproveResultsHandler } from './commands/handlers/approve-results/approve-results.handler.js';
import { RequestResultCorrectionsHandler } from './commands/handlers/request-result-corrections/request-result-corrections.handler.js';
import { ReopenResultsHandler } from './commands/handlers/reopen-results/reopen-results.handler.js';
import { ListLecturerResultsHandler } from './queries/handlers/list-lecturer-results/list-lecturer-results.handler.js';
import { ListDepartmentResultsHandler } from './queries/handlers/list-department-results/list-department-results.handler.js';
import { ReadResultGroupHandler } from './queries/handlers/read-result-group/read-result-group.handler.js';
import { StudentResultHistoryHandler } from './queries/handlers/student-result-history/student-result-history.handler.js';
import { StudentResultStatementHandler } from './queries/handlers/student-result-statement/student-result-statement.handler.js';
import { LecturerResultsController } from './controllers/lecturer-results.controller.js';
import { DepartmentResultsController } from './controllers/department-results.controller.js';
import { StudentResultsController } from './controllers/student-results.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ResultGroup])],
  controllers: [
    LecturerResultsController,
    DepartmentResultsController,
    StudentResultsController,
  ],
  providers: [
    ResultAccessService,
    ResultWorkflowService,
    ResultReviewService,
    StudentResultsService,
    SaveResultMarksHandler,
    SubmitResultsHandler,
    ApproveResultsHandler,
    RequestResultCorrectionsHandler,
    ReopenResultsHandler,
    ListLecturerResultsHandler,
    ListDepartmentResultsHandler,
    ReadResultGroupHandler,
    StudentResultHistoryHandler,
    StudentResultStatementHandler,
  ],
})
export class ResultsModule {}
