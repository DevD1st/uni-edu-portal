import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { AdvanceAuthVersionCommand } from '#shared/auth/user.contracts.js';
import type { IUserRepository } from '../../../repositories/user.repository.js';
import { USER_REPOSITORY } from '../../../util/constants.js';

@CommandHandler(AdvanceAuthVersionCommand)
export class AdvanceAuthVersionHandler
  implements ICommandHandler<AdvanceAuthVersionCommand>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly repository: IUserRepository,
  ) {}

  execute(command: AdvanceAuthVersionCommand) {
    return this.repository.advanceAuthVersion(
      command.userId,
      command.expectedVersion,
    );
  }
}
