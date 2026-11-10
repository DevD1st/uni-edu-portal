import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { RequestResultCorrectionsCommand } from '../../result-workflow.js';
import { ResultWorkflowService } from '../../../services/result-workflow.service.js';

@CommandHandler(RequestResultCorrectionsCommand)
export class RequestResultCorrectionsHandler
  implements ICommandHandler<RequestResultCorrectionsCommand>
{
  constructor(private readonly service: ResultWorkflowService) {}

  execute(message: RequestResultCorrectionsCommand) {
    return this.service.requestCorrections(
      message.actorId,
      message.id,
      message.input,
    );
  }
}
