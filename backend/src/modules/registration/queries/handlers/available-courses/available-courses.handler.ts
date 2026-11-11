import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { AvailableCoursesQuery } from '../../academic-workflow.js';
import { RegistrationService } from '../../../services/registration.service.js';

@QueryHandler(AvailableCoursesQuery)
export class AvailableCoursesHandler implements IQueryHandler<AvailableCoursesQuery> {
  constructor(private readonly service: RegistrationService) {}

  execute(message: AvailableCoursesQuery) {
    return this.service.available(
      message.actor,
      message.semesterId,
      message.studentUserId,
    );
  }
}
