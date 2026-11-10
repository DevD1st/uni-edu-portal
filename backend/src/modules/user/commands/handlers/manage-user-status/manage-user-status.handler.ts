import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { ManageUserStatusCommand } from '../../impl.js';
import { UserAdministrationService } from '../../../services/user-administration.service.js';

@CommandHandler(ManageUserStatusCommand)
export class ManageUserStatusHandler
  implements ICommandHandler<ManageUserStatusCommand>
{
  constructor(private readonly service: UserAdministrationService) {}

  execute(command: ManageUserStatusCommand) {
    return this.service.manageStatus(
      command.actorUserId,
      command.userId,
      command.status,
    );
  }
}
