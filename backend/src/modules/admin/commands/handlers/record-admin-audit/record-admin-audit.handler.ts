import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { RecordAdminAuditCommand } from '#shared/admin-authorization/audit.contracts.js';
import { AdminAuditService } from '../../../services/admin-audit.service.js';

@CommandHandler(RecordAdminAuditCommand)
export class RecordAdminAuditHandler
  implements ICommandHandler<RecordAdminAuditCommand>
{
  constructor(private readonly service: AdminAuditService) {}

  execute(message: RecordAdminAuditCommand) {
    return this.service.record(message.attempt);
  }
}
