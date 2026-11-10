import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { StudentResultHistoryQuery } from '../../result-workflow.js';
import { StudentResultsService } from '../../../services/student-results.service.js';

@QueryHandler(StudentResultHistoryQuery)
export class StudentResultHistoryHandler
  implements IQueryHandler<StudentResultHistoryQuery>
{
  constructor(private readonly service: StudentResultsService) {}

  execute(message: StudentResultHistoryQuery) {
    return this.service.history(message.actor);
  }
}
