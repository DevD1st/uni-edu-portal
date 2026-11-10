import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { UpdateOfferingCommand } from '../../academic-workflow.js';
import { CourseSetupService } from '../../../services/course-setup.service.js';

@CommandHandler(UpdateOfferingCommand)
export class UpdateOfferingHandler
  implements ICommandHandler<UpdateOfferingCommand>
{
  constructor(private readonly service: CourseSetupService) {}

  execute(message: UpdateOfferingCommand) {
    return this.service.updateOffering(
      message.actorId,
      message.id,
      message.input,
    );
  }
}
