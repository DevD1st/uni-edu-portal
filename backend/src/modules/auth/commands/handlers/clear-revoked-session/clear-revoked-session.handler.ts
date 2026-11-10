import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { ClearRevokedSessionCommand } from '../../impl.js';
import { TokenRegistryService } from '../../../services/token-registry.service.js';

@CommandHandler(ClearRevokedSessionCommand)
export class ClearRevokedSessionHandler
  implements ICommandHandler<ClearRevokedSessionCommand>
{
  constructor(private readonly service: TokenRegistryService) {}

  execute(message: ClearRevokedSessionCommand) {
    return this.service.removeOlderThan(message.userId, message.authVersion);
  }
}
