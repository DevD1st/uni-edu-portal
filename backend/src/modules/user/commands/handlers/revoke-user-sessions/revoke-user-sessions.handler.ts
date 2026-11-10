import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { RevokeUserSessionsCommand } from '../../impl.js';
import { UserAdministrationService } from '../../../services/user-administration.service.js';

@CommandHandler(RevokeUserSessionsCommand)
export class RevokeUserSessionsHandler
  implements ICommandHandler<RevokeUserSessionsCommand>
{
  constructor(private readonly service: UserAdministrationService) {}

  execute(command: RevokeUserSessionsCommand) {
    return this.service.revokeSessions(command.actorUserId, command.userId);
  }
}
