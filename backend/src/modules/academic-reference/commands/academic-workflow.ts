import { Command } from '@nestjs/cqrs';
import type {
  AcademicLevelSetupDto,
  SetAcademicLevelStatusDto,
  FacultySetupResponseDto,
  FacultyWriteDto,
  DepartmentSetupResponseDto,
  DepartmentWriteDto,
  ProgrammeSetupResponseDto,
  ProgrammeWriteDto,
  SessionSetupResponseDto,
  SessionWriteDto,
  SemesterSetupResponseDto,
  SemesterWriteDto,
} from '../dtos/academic-setup.dto.js';

export class SetAcademicLevelStatusCommand extends Command<AcademicLevelSetupDto> {
  constructor(
    readonly actorId: string,
    readonly id: string,
    readonly input: SetAcademicLevelStatusDto,
  ) {
    super();
  }
}

export class SaveFacultyCommand extends Command<FacultySetupResponseDto> {
  constructor(
    readonly actorId: string,
    readonly input: FacultyWriteDto,
    readonly id?: string,
  ) {
    super();
  }
}

export class SaveDepartmentCommand extends Command<DepartmentSetupResponseDto> {
  constructor(
    readonly actorId: string,
    readonly input: DepartmentWriteDto,
    readonly id?: string,
  ) {
    super();
  }
}

export class SaveProgrammeCommand extends Command<ProgrammeSetupResponseDto> {
  constructor(
    readonly actorId: string,
    readonly input: ProgrammeWriteDto,
    readonly id?: string,
  ) {
    super();
  }
}

export class SaveSessionCommand extends Command<SessionSetupResponseDto> {
  constructor(
    readonly actorId: string,
    readonly input: SessionWriteDto,
    readonly id?: string,
  ) {
    super();
  }
}

export class SaveSemesterCommand extends Command<SemesterSetupResponseDto> {
  constructor(
    readonly actorId: string,
    readonly input: SemesterWriteDto,
    readonly id?: string,
  ) {
    super();
  }
}

export class SetCurrentSemesterCommand extends Command<FacultySetupResponseDto> {
  constructor(
    readonly actorId: string,
    readonly id: string,
    readonly semesterId: string | null,
  ) {
    super();
  }
}
