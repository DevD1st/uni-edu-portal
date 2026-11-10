import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { RecordTransactionalAdminAuditCommand } from '#shared/admin-authorization/audit.contracts.js';
import { AdminAuditService } from '../../../services/admin-audit.service.js';

@CommandHandler(RecordTransactionalAdminAuditCommand)
export class RecordTransactionalAdminAuditHandler
  implements ICommandHandler<RecordTransactionalAdminAuditCommand>
{
  constructor(private readonly service: AdminAuditService) {}

  execute(message: RecordTransactionalAdminAuditCommand) {
    return this.service.recordTransaction(message);
  }
}
