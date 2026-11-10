import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationService } from './services/registration.service.js';
import { StudentRegistrationController } from './controllers/student-registration.controller.js';
import { DepartmentRegistrationController } from './controllers/department-registration.controller.js';
import { LecturerRegistrationController } from './controllers/lecturer-registration.controller.js';
import { AvailableCoursesHandler } from './queries/handlers/available-courses/available-courses.handler.js';
import { RegisterCoursesHandler } from './commands/handlers/register-courses/register-courses.handler.js';
import { RegisteredTermsHandler } from './queries/handlers/registered-terms/registered-terms.handler.js';
import { RegistrationSummaryHandler } from './queries/handlers/registration-summary/registration-summary.handler.js';
import { DepartmentRegistrationReportHandler } from './queries/handlers/department-registration-report/department-registration-report.handler.js';
import { TeachingOfferingsHandler } from './queries/handlers/teaching-offerings/teaching-offerings.handler.js';
import { LecturerRosterHandler } from './queries/handlers/lecturer-roster/lecturer-roster.handler.js';
import { CloseRegistrationRosterHandler } from './commands/handlers/close-registration-roster/close-registration-roster.handler.js';
import { StudentRegisterSemester } from './entity/student-register-semesters.entity.js';
import { StudentRegisteredCourse } from './entity/student-registered-courses.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentRegisterSemester,
      StudentRegisteredCourse,
    ]),
  ],
  controllers: [
    StudentRegistrationController,
    DepartmentRegistrationController,
    LecturerRegistrationController,
  ],
  providers: [
    RegistrationService,
    AvailableCoursesHandler,
    RegisterCoursesHandler,
    RegisteredTermsHandler,
    RegistrationSummaryHandler,
    DepartmentRegistrationReportHandler,
    TeachingOfferingsHandler,
    LecturerRosterHandler,
    CloseRegistrationRosterHandler,
  ],
})
export class RegistrationModule {}
