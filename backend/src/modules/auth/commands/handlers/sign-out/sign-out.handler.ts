import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { SignOutCommand } from '../../impl.js';
import { AuthenticationService } from '../../../services/authentication.service.js';

@CommandHandler(SignOutCommand)
export class SignOutHandler implements ICommandHandler<SignOutCommand> {
  constructor(private readonly service: AuthenticationService) {}

  execute(message: SignOutCommand) {
    return this.service.logout(message.account);
  }
}
