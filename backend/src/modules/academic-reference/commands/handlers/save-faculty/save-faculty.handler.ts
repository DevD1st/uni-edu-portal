import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { SaveFacultyCommand } from '../../academic-workflow.js';
import { AcademicSetupService } from '../../../services/academic-setup.service.js';

@CommandHandler(SaveFacultyCommand)
export class SaveFacultyHandler implements ICommandHandler<SaveFacultyCommand> {
  constructor(private readonly service: AcademicSetupService) {}

  execute(message: SaveFacultyCommand) {
    return this.service.saveFaculty(message.actorId, message.input, message.id);
  }
}
