import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { AssignAdminRoleCommand } from '../../impl.js';
import { AdminManagementService } from '../../../services/admin-management.service.js';

@CommandHandler(AssignAdminRoleCommand)
export class AssignAdminRoleHandler
  implements ICommandHandler<AssignAdminRoleCommand>
{
  constructor(private readonly service: AdminManagementService) {}

  execute(message: AssignAdminRoleCommand) {
    return this.service.assignRole(
      message.actorUserId,
      message.adminId,
      message.input,
    );
  }
}
