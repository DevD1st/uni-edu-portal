import { Command } from '@nestjs/cqrs';
import type {
  CourseResponseDto,
  CourseWriteDto,
  CurriculumResponseDto,
  CurriculumWriteDto,
  OfferingResponseDto,
  OfferingWriteDto,
  OfferingUpdateDto,
} from '../dtos/course-setup.dto.js';

export class SaveCourseCommand extends Command<CourseResponseDto> {
  constructor(
    readonly actorId: string,
    readonly input: CourseWriteDto,
    readonly id?: string,
  ) {
    super();
  }
}

export class AddCurriculumCourseCommand extends Command<CurriculumResponseDto> {
  constructor(
    readonly actorId: string,
    readonly input: CurriculumWriteDto,
  ) {
    super();
  }
}

export class RemoveCurriculumCourseCommand extends Command<void> {
  constructor(
    readonly actorId: string,
    readonly id: string,
  ) {
    super();
  }
}

export class CreateOfferingCommand extends Command<OfferingResponseDto> {
  constructor(
    readonly actorId: string,
    readonly input: OfferingWriteDto,
  ) {
    super();
  }
}

export class UpdateOfferingCommand extends Command<OfferingResponseDto> {
  constructor(
    readonly actorId: string,
    readonly id: string,
    readonly input: OfferingUpdateDto,
  ) {
    super();
  }
}
