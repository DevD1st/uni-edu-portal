import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { SetAcademicLevelStatusCommand } from '../../academic-workflow.js';
import { AcademicSetupService } from '../../../services/academic-setup.service.js';

@CommandHandler(SetAcademicLevelStatusCommand)
export class SetAcademicLevelStatusHandler
  implements ICommandHandler<SetAcademicLevelStatusCommand>
{
  constructor(private readonly service: AcademicSetupService) {}

  execute(message: SetAcademicLevelStatusCommand) {
    return this.service.setLevelStatus(
      message.actorId,
      message.id,
      message.input,
    );
  }
}
