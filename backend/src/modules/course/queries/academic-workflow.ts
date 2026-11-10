import { Query } from '@nestjs/cqrs';
import type {
  CourseSetupResponseDto,
  LecturerChoicesResponseDto,
} from '../dtos/course-setup.dto.js';

export class ReadCourseSetupQuery extends Query<CourseSetupResponseDto> {
  constructor(readonly actorId: string) {
    super();
  }
}

export class ListLecturerChoicesQuery extends Query<LecturerChoicesResponseDto> {
  constructor(
    readonly actorId: string,
    readonly departmentId: string,
  ) {
    super();
  }
}
