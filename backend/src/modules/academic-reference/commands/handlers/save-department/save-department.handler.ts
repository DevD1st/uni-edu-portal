import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { SaveDepartmentCommand } from '../../academic-workflow.js';
import { AcademicSetupService } from '../../../services/academic-setup.service.js';

@CommandHandler(SaveDepartmentCommand)
export class SaveDepartmentHandler
  implements ICommandHandler<SaveDepartmentCommand>
{
  constructor(private readonly service: AcademicSetupService) {}

  execute(message: SaveDepartmentCommand) {
    return this.service.saveDepartment(
      message.actorId,
      message.input,
      message.id,
    );
  }
}
