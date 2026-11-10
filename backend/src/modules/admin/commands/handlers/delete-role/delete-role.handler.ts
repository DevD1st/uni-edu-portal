import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { DeleteRoleCommand } from '../../impl.js';
import { AdminManagementService } from '../../../services/admin-management.service.js';

@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler implements ICommandHandler<DeleteRoleCommand> {
  constructor(private readonly service: AdminManagementService) {}

  execute(message: DeleteRoleCommand) {
    return this.service.deleteRole(message.actorUserId, message.roleId);
  }
}
