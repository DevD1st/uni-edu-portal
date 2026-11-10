import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { TeachingOfferingsQuery } from '../../academic-workflow.js';
import { RegistrationService } from '../../../services/registration.service.js';

@QueryHandler(TeachingOfferingsQuery)
export class TeachingOfferingsHandler
  implements IQueryHandler<TeachingOfferingsQuery>
{
  constructor(private readonly service: RegistrationService) {}

  execute(message: TeachingOfferingsQuery) {
    return this.service.teachingOfferings(message.actorId);
  }
}
