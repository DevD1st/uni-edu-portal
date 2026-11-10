import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { UpdateStudentPlacementCommand } from '../../impl.js';
import { UserAdministrationService } from '../../../services/user-administration.service.js';

@CommandHandler(UpdateStudentPlacementCommand)
export class UpdateStudentPlacementHandler
  implements ICommandHandler<UpdateStudentPlacementCommand>
{
  constructor(private readonly service: UserAdministrationService) {}

  execute(command: UpdateStudentPlacementCommand) {
    return this.service.updatePlacement(
      command.actorUserId,
      command.userId,
      command.input,
    );
  }
}
