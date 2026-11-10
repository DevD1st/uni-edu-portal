import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ListDepartmentResultsQuery } from '../../result-workflow.js';
import { ResultReviewService } from '../../../services/result-review.service.js';

@QueryHandler(ListDepartmentResultsQuery)
export class ListDepartmentResultsHandler
  implements IQueryHandler<ListDepartmentResultsQuery>
{
  constructor(private readonly service: ResultReviewService) {}

  execute(message: ListDepartmentResultsQuery) {
    return this.service.listForDepartment(message.actorId, message.query);
  }
}
