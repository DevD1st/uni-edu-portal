import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { LecturerRosterQuery } from '../../academic-workflow.js';
import { RegistrationService } from '../../../services/registration.service.js';

@QueryHandler(LecturerRosterQuery)
export class LecturerRosterHandler
  implements IQueryHandler<LecturerRosterQuery>
{
  constructor(private readonly service: RegistrationService) {}

  execute(message: LecturerRosterQuery) {
    return this.service.lecturerRoster(
      message.actorId,
      message.id,
      message.input,
    );
  }
}
