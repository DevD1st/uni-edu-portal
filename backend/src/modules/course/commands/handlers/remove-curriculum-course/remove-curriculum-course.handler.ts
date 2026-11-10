import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { RemoveCurriculumCourseCommand } from '../../academic-workflow.js';
import { CourseSetupService } from '../../../services/course-setup.service.js';

@CommandHandler(RemoveCurriculumCourseCommand)
export class RemoveCurriculumCourseHandler
  implements ICommandHandler<RemoveCurriculumCourseCommand>
{
  constructor(private readonly service: CourseSetupService) {}

  execute(message: RemoveCurriculumCourseCommand) {
    return this.service.removeCurriculum(message.actorId, message.id);
  }
}
