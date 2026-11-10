import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { RefreshSessionCommand } from '../../impl.js';
import { AuthenticationService } from '../../../services/authentication.service.js';

@CommandHandler(RefreshSessionCommand)
export class RefreshSessionHandler
  implements ICommandHandler<RefreshSessionCommand>
{
  constructor(private readonly service: AuthenticationService) {}

  execute(message: RefreshSessionCommand) {
    return this.service.refresh(message.token);
  }
}
