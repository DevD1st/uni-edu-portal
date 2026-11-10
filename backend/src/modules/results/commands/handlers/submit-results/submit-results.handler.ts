import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { SubmitResultsCommand } from '../../result-workflow.js';
import { ResultWorkflowService } from '../../../services/result-workflow.service.js';

@CommandHandler(SubmitResultsCommand)
export class SubmitResultsHandler
  implements ICommandHandler<SubmitResultsCommand>
{
  constructor(private readonly service: ResultWorkflowService) {}

  execute(message: SubmitResultsCommand) {
    return this.service.submit(message.actorId, message.id, message.input);
  }
}
