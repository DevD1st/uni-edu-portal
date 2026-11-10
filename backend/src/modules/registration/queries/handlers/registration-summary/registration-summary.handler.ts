import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { RegistrationSummaryQuery } from '../../academic-workflow.js';
import { RegistrationService } from '../../../services/registration.service.js';

@QueryHandler(RegistrationSummaryQuery)
export class RegistrationSummaryHandler
  implements IQueryHandler<RegistrationSummaryQuery>
{
  constructor(private readonly service: RegistrationService) {}

  execute(message: RegistrationSummaryQuery) {
    return this.service.summary(message.actor, message.id);
  }
}
