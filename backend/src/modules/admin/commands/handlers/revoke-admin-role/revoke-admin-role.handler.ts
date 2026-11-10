import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { RevokeAdminRoleCommand } from '../../impl.js';
import { AdminManagementService } from '../../../services/admin-management.service.js';

@CommandHandler(RevokeAdminRoleCommand)
export class RevokeAdminRoleHandler
  implements ICommandHandler<RevokeAdminRoleCommand>
{
  constructor(private readonly service: AdminManagementService) {}

  execute(message: RevokeAdminRoleCommand) {
    return this.service.revokeRole(
      message.actorUserId,
      message.adminId,
      message.grantId,
    );
  }
}
