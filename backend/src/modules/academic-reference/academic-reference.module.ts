import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicSetupService } from './services/academic-setup.service.js';
import { AcademicSetupController } from './controllers/academic-setup.controller.js';
import { SaveFacultyHandler } from './commands/handlers/save-faculty/save-faculty.handler.js';
import { SaveDepartmentHandler } from './commands/handlers/save-department/save-department.handler.js';
import { SaveProgrammeHandler } from './commands/handlers/save-programme/save-programme.handler.js';
import { SaveSessionHandler } from './commands/handlers/save-session/save-session.handler.js';
import { SaveSemesterHandler } from './commands/handlers/save-semester/save-semester.handler.js';
import { SetCurrentSemesterHandler } from './commands/handlers/set-current-semester/set-current-semester.handler.js';
import { ReadAcademicSetupHandler } from './queries/handlers/read-academic-setup/read-academic-setup.handler.js';
import { AcademicReferencesController } from './controllers/academic-references.controller.js';
import { GetAcademicReferencesHandler } from './queries/handlers/get-academic-references/get-academic-references.handler.js';
import { AcademicLevel } from './entity/academic-levels.entity.js';
import { AcademicSession } from './entity/academic-sessions.entity.js';
import { Semester } from './entity/semesters.entity.js';
import { Faculty } from './entity/faculties.entity.js';
import { Department } from './entity/departments.entity.js';
import { CourseOfStudy } from './entity/courses-of-study.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AcademicLevel,
      AcademicSession,
      Semester,
      Faculty,
      Department,
      CourseOfStudy,
    ]),
  ],
  controllers: [AcademicReferencesController, AcademicSetupController],
  providers: [
    GetAcademicReferencesHandler,
    AcademicSetupService,
    SaveFacultyHandler,
    SaveDepartmentHandler,
    SaveProgrammeHandler,
    SaveSessionHandler,
    SaveSemesterHandler,
    SetCurrentSemesterHandler,
    ReadAcademicSetupHandler,
  ],
})
export class AcademicReferenceModule {}
