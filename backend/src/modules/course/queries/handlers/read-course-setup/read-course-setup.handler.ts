import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ReadCourseSetupQuery } from '../../academic-workflow.js';
import { CourseSetupService } from '../../../services/course-setup.service.js';

@QueryHandler(ReadCourseSetupQuery)
export class ReadCourseSetupHandler
  implements IQueryHandler<ReadCourseSetupQuery>
{
  constructor(private readonly service: CourseSetupService) {}

  execute(message: ReadCourseSetupQuery) {
    return this.service.read(message.actorId);
  }
}
