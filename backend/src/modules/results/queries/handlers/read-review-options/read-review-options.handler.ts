import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ReadReviewOptionsQuery } from '../../result-workflow.js';
import { ResultReviewService } from '../../../services/result-review.service.js';

@QueryHandler(ReadReviewOptionsQuery)
export class ReadReviewOptionsHandler implements IQueryHandler<ReadReviewOptionsQuery> {
  constructor(private readonly service: ResultReviewService) {}

  execute(message: ReadReviewOptionsQuery) {
    return this.service.options(message.actorId);
  }
}
