import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { RegisterCoursesCommand } from '../../academic-workflow.js';
import { RegistrationService } from '../../../services/registration.service.js';

@CommandHandler(RegisterCoursesCommand)
export class RegisterCoursesHandler
  implements ICommandHandler<RegisterCoursesCommand>
{
  constructor(private readonly service: RegistrationService) {}

  execute(message: RegisterCoursesCommand) {
    return this.service.register(
      message.actor,
      message.input,
      message.studentUserId,
    );
  }
}
