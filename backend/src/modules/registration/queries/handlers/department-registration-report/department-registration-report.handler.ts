import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { DepartmentRegistrationReportQuery } from '../../academic-workflow.js';
import { RegistrationService } from '../../../services/registration.service.js';

@QueryHandler(DepartmentRegistrationReportQuery)
export class DepartmentRegistrationReportHandler
  implements IQueryHandler<DepartmentRegistrationReportQuery>
{
  constructor(private readonly service: RegistrationService) {}

  execute(message: DepartmentRegistrationReportQuery) {
    return this.service.report(message.actorId, message.input);
  }
}
