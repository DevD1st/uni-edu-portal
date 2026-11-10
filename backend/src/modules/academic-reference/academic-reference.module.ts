import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
  controllers: [AcademicReferencesController],
  providers: [GetAcademicReferencesHandler],
})
export class AcademicReferenceModule {}
