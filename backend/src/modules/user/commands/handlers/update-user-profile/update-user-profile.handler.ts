import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserProfileCommand } from '../../impl.js';
import { UserAdministrationService } from '../../../services/user-administration.service.js';

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler
  implements ICommandHandler<UpdateUserProfileCommand>
{
  constructor(private readonly service: UserAdministrationService) {}

  execute(command: UpdateUserProfileCommand) {
    return this.service.updateProfile(
      command.userId,
      command.input,
      command.actorUserId,
    );
  }
}
