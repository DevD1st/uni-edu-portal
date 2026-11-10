import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { AddCurriculumCourseCommand } from '../../academic-workflow.js';
import { CourseSetupService } from '../../../services/course-setup.service.js';

@CommandHandler(AddCurriculumCourseCommand)
export class AddCurriculumCourseHandler
  implements ICommandHandler<AddCurriculumCourseCommand>
{
  constructor(private readonly service: CourseSetupService) {}

  execute(message: AddCurriculumCourseCommand) {
    return this.service.addCurriculum(message.actorId, message.input);
  }
}
