import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { ApproveResultsCommand } from '../../result-workflow.js';
import { ResultWorkflowService } from '../../../services/result-workflow.service.js';

@CommandHandler(ApproveResultsCommand)
export class ApproveResultsHandler
  implements ICommandHandler<ApproveResultsCommand>
{
  constructor(private readonly service: ResultWorkflowService) {}

  execute(message: ApproveResultsCommand) {
    return this.service.approve(message.actorId, message.id, message.input);
  }
}
