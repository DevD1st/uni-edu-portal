import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ReadResultGroupQuery } from '../../result-workflow.js';
import { ResultReviewService } from '../../../services/result-review.service.js';

@QueryHandler(ReadResultGroupQuery)
export class ReadResultGroupHandler
  implements IQueryHandler<ReadResultGroupQuery>
{
  constructor(private readonly service: ResultReviewService) {}

  execute(message: ReadResultGroupQuery) {
    return this.service.detail(
      message.actorId,
      message.id,
      message.query,
      message.scope,
    );
  }
}
