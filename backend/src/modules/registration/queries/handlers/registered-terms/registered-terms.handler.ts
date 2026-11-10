import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { RegisteredTermsQuery } from '../../academic-workflow.js';
import { RegistrationService } from '../../../services/registration.service.js';

@QueryHandler(RegisteredTermsQuery)
export class RegisteredTermsHandler
  implements IQueryHandler<RegisteredTermsQuery>
{
  constructor(private readonly service: RegistrationService) {}

  execute(message: RegisteredTermsQuery) {
    return this.service.terms(message.actor);
  }
}
