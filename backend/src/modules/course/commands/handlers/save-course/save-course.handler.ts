import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { SaveCourseCommand } from '../../academic-workflow.js';
import { CourseSetupService } from '../../../services/course-setup.service.js';

@CommandHandler(SaveCourseCommand)
export class SaveCourseHandler implements ICommandHandler<SaveCourseCommand> {
  constructor(private readonly service: CourseSetupService) {}

  execute(message: SaveCourseCommand) {
    return this.service.saveCourse(message.actorId, message.input, message.id);
  }
}
