import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { CloseRegistrationRosterCommand } from '../../academic-workflow.js';
import { RegistrationService } from '../../../services/registration.service.js';

@CommandHandler(CloseRegistrationRosterCommand)
export class CloseRegistrationRosterHandler
  implements ICommandHandler<CloseRegistrationRosterCommand>
{
  constructor(private readonly service: RegistrationService) {}

  execute(message: CloseRegistrationRosterCommand) {
    return this.service.closeRoster(message.actorId, message.id);
  }
}
