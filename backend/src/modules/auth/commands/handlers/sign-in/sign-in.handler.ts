import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { SignInCommand } from '../../impl.js';
import { AuthenticationService } from '../../../services/authentication.service.js';

@CommandHandler(SignInCommand)
export class SignInHandler implements ICommandHandler<SignInCommand> {
  constructor(private readonly service: AuthenticationService) {}

  execute(message: SignInCommand) {
    return this.service.signIn(message.email, message.password, message.role);
  }
}
