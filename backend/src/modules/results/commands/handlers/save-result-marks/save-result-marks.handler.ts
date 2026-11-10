import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { SaveResultMarksCommand } from '../../result-workflow.js';
import { ResultWorkflowService } from '../../../services/result-workflow.service.js';

@CommandHandler(SaveResultMarksCommand)
export class SaveResultMarksHandler
  implements ICommandHandler<SaveResultMarksCommand>
{
  constructor(private readonly service: ResultWorkflowService) {}

  execute(message: SaveResultMarksCommand) {
    return this.service.saveMarks(message.actorId, message.id, message.input);
  }
}
