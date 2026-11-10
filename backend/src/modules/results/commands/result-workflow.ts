import { Command } from '@nestjs/cqrs';
import type {
  SaveResultMarksDto,
  ResultDecisionNoteDto,
  RequestResultCorrectionsDto,
  ReopenResultDto,
} from '../dtos/result-write.dto.js';
import type {
  SaveMarksResponseDto,
  ResultStateResponseDto,
} from '../dtos/result-review.dto.js';

export class SaveResultMarksCommand extends Command<SaveMarksResponseDto> {
  constructor(
    readonly actorId: string,
    readonly id: string,
    readonly input: SaveResultMarksDto,
  ) {
    super();
  }
}

export class SubmitResultsCommand extends Command<ResultStateResponseDto> {
  constructor(
    readonly actorId: string,
    readonly id: string,
    readonly input: ResultDecisionNoteDto,
  ) {
    super();
  }
}

export class ApproveResultsCommand extends Command<ResultStateResponseDto> {
  constructor(
    readonly actorId: string,
    readonly id: string,
    readonly input: ResultDecisionNoteDto,
  ) {
    super();
  }
}

export class RequestResultCorrectionsCommand extends Command<ResultStateResponseDto> {
  constructor(
    readonly actorId: string,
    readonly id: string,
    readonly input: RequestResultCorrectionsDto,
  ) {
    super();
  }
}

export class ReopenResultsCommand extends Command<ResultStateResponseDto> {
  constructor(
    readonly actorId: string,
    readonly id: string,
    readonly input: ReopenResultDto,
  ) {
    super();
  }
}
