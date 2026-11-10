import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from '../../impl.js';
import { UserAdministrationService } from '../../../services/user-administration.service.js';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler
  implements ICommandHandler<ChangePasswordCommand>
{
  constructor(private readonly service: UserAdministrationService) {}

  execute(command: ChangePasswordCommand) {
    return this.service.changePassword(
      command.userId,
      command.currentPassword,
      command.newPassword,
    );
  }
}
