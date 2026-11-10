import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { StudentResultStatementQuery } from '../../result-workflow.js';
import { StudentResultsService } from '../../../services/student-results.service.js';

@QueryHandler(StudentResultStatementQuery)
export class StudentResultStatementHandler
  implements IQueryHandler<StudentResultStatementQuery>
{
  constructor(private readonly service: StudentResultsService) {}

  execute(message: StudentResultStatementQuery) {
    return this.service.statement(message.actor, message.id);
  }
}
