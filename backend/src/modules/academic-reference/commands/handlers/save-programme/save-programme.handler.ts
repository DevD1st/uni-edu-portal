import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { SaveProgrammeCommand } from '../../academic-workflow.js';
import { AcademicSetupService } from '../../../services/academic-setup.service.js';

@CommandHandler(SaveProgrammeCommand)
export class SaveProgrammeHandler
  implements ICommandHandler<SaveProgrammeCommand>
{
  constructor(private readonly service: AcademicSetupService) {}

  execute(message: SaveProgrammeCommand) {
    return this.service.saveProgramme(
      message.actorId,
      message.input,
      message.id,
    );
  }
}
