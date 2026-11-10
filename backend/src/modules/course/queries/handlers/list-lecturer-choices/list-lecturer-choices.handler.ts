import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ListLecturerChoicesQuery } from '../../academic-workflow.js';
import { CourseSetupService } from '../../../services/course-setup.service.js';

@QueryHandler(ListLecturerChoicesQuery)
export class ListLecturerChoicesHandler
  implements IQueryHandler<ListLecturerChoicesQuery>
{
  constructor(private readonly service: CourseSetupService) {}

  execute(message: ListLecturerChoicesQuery) {
    return this.service.lecturers(message.actorId, message.departmentId);
  }
}
