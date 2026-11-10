import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { CreateStudentAccountCommand } from '#shared/auth/user.contracts.js';
import { UserAdministrationService } from '../../../services/user-administration.service.js';

@CommandHandler(CreateStudentAccountCommand)
export class CreateStudentAccountHandler
  implements ICommandHandler<CreateStudentAccountCommand>
{
  constructor(private readonly service: UserAdministrationService) {}

  execute(command: CreateStudentAccountCommand) {
    return this.service.createStudent(command.input, command.actorUserId);
  }
}
