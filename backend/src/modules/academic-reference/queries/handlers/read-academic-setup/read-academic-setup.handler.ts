import { QueryHandler } from '@nestjs/cqrs';
import type { IQueryHandler } from '@nestjs/cqrs';
import { ReadAcademicSetupQuery } from '../../academic-workflow.js';
import { AcademicSetupService } from '../../../services/academic-setup.service.js';

@QueryHandler(ReadAcademicSetupQuery)
export class ReadAcademicSetupHandler
  implements IQueryHandler<ReadAcademicSetupQuery>
{
  constructor(private readonly service: AcademicSetupService) {}

  execute(message: ReadAcademicSetupQuery) {
    return this.service.read(message.actorId);
  }
}
