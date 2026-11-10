import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { SetCurrentSemesterCommand } from '../../academic-workflow.js';
import { AcademicSetupService } from '../../../services/academic-setup.service.js';

@CommandHandler(SetCurrentSemesterCommand)
export class SetCurrentSemesterHandler
  implements ICommandHandler<SetCurrentSemesterCommand>
{
  constructor(private readonly service: AcademicSetupService) {}

  execute(message: SetCurrentSemesterCommand) {
    return this.service.setCurrentSemester(
      message.actorId,
      message.id,
      message.semesterId,
    );
  }
}
