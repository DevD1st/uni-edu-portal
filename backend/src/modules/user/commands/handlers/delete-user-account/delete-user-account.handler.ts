import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserAccountCommand } from '../../impl.js';
import { UserAdministrationService } from '../../../services/user-administration.service.js';

@CommandHandler(DeleteUserAccountCommand)
export class DeleteUserAccountHandler
  implements ICommandHandler<DeleteUserAccountCommand>
{
  constructor(private readonly service: UserAdministrationService) {}

  execute(command: DeleteUserAccountCommand) {
    return this.service.deleteAccount(command.userId, command.actorUserId);
  }
}
