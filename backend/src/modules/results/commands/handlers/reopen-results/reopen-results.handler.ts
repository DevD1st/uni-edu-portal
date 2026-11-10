import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { ReopenResultsCommand } from '../../result-workflow.js';
import { ResultWorkflowService } from '../../../services/result-workflow.service.js';

@CommandHandler(ReopenResultsCommand)
export class ReopenResultsHandler
  implements ICommandHandler<ReopenResultsCommand>
{
  constructor(private readonly service: ResultWorkflowService) {}

  execute(message: ReopenResultsCommand) {
    return this.service.reopen(message.actorId, message.id, message.input);
  }
}
