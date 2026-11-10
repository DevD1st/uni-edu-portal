import { CommandHandler } from '@nestjs/cqrs';
import type { ICommandHandler } from '@nestjs/cqrs';
import { CreateOfferingCommand } from '../../academic-workflow.js';
import { CourseSetupService } from '../../../services/course-setup.service.js';

@CommandHandler(CreateOfferingCommand)
export class CreateOfferingHandler
  implements ICommandHandler<CreateOfferingCommand>
{
  constructor(private readonly service: CourseSetupService) {}

  execute(message: CreateOfferingCommand) {
    return this.service.createOffering(message.actorId, message.input);
  }
}
