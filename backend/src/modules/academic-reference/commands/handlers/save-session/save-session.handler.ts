import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { SaveSessionCommand } from '../../academic-workflow.js';
import { AcademicSetupService } from '../../../services/academic-setup.service.js';

@CommandHandler(SaveSessionCommand)
export class SaveSessionHandler implements ICommandHandler<SaveSessionCommand> {
  constructor(private readonly service: AcademicSetupService) {}

  execute(message: SaveSessionCommand) {
    return this.service.saveSession(message.actorId, message.input, message.id);
  }
}
