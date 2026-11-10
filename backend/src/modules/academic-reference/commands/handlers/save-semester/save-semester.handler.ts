import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { SaveSemesterCommand } from '../../academic-workflow.js';
import { AcademicSetupService } from '../../../services/academic-setup.service.js';

@CommandHandler(SaveSemesterCommand)
export class SaveSemesterHandler
  implements ICommandHandler<SaveSemesterCommand>
{
  constructor(private readonly service: AcademicSetupService) {}

  execute(message: SaveSemesterCommand) {
    return this.service.saveSemester(
      message.actorId,
      message.input,
      message.id,
    );
  }
}
