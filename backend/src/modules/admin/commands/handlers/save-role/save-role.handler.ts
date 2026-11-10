import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { SaveRoleCommand } from '../../impl.js';
import { AdminManagementService } from '../../../services/admin-management.service.js';

@CommandHandler(SaveRoleCommand)
export class SaveRoleHandler implements ICommandHandler<SaveRoleCommand> {
  constructor(private readonly service: AdminManagementService) {}

  execute(message: SaveRoleCommand) {
    return this.service.saveRole(
      message.actorUserId,
      message.input,
      message.roleId,
    );
  }
}
