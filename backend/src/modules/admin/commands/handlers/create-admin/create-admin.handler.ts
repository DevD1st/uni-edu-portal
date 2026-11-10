import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { CreateAdminCommand } from '../../impl.js';
import { AdminManagementService } from '../../../services/admin-management.service.js';

@CommandHandler(CreateAdminCommand)
export class CreateAdminHandler implements ICommandHandler<CreateAdminCommand> {
  constructor(private readonly service: AdminManagementService) {}

  execute(message: CreateAdminCommand) {
    return this.service.createAdmin(message.actorUserId, message.input);
  }
}
