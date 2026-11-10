import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ListLecturerResultsQuery } from '../../result-workflow.js';
import { ResultReviewService } from '../../../services/result-review.service.js';

@QueryHandler(ListLecturerResultsQuery)
export class ListLecturerResultsHandler
  implements IQueryHandler<ListLecturerResultsQuery>
{
  constructor(private readonly service: ResultReviewService) {}

  execute(message: ListLecturerResultsQuery) {
    return this.service.listForLecturer(message.actorId, message.query);
  }
}
