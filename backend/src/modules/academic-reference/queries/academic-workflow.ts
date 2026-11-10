import { Query } from '@nestjs/cqrs';
import type { AcademicSetupResponseDto } from '../dtos/academic-setup.dto.js';

export class ReadAcademicSetupQuery extends Query<AcademicSetupResponseDto> {
  constructor(readonly actorId: string) {
    super();
  }
}
