import { Module } from '@nestjs/common';
import { CoreModule } from '#core/core.module.js';
import { SharedModule } from '#shared/shared.module.js';
import { AcademicReferenceModule } from '#modules/academic-reference/academic-reference.module.js';
import { AdminModule } from '#modules/admin/admin.module.js';
import { AuthModule } from '#modules/auth/auth.module.js';
import { UserModule } from '#modules/user/user.module.js';
import { StudentModule } from '#modules/student/student.module.js';
import { CourseModule } from '#modules/course/course.module.js';
import { RegistrationModule } from '#modules/registration/registration.module.js';
import { ResultsModule } from '#modules/results/results.module.js';
import { GradingModule } from '#modules/grading/grading.module.js';
import { ReportingModule } from '#modules/reporting/reporting.module.js';

@Module({
  imports: [
    CoreModule,
    SharedModule,
    AcademicReferenceModule,
    UserModule,
    AuthModule,
    AdminModule,
    StudentModule,
    CourseModule,
    RegistrationModule,
    ResultsModule,
    GradingModule,
    ReportingModule,
  ],
})
export class AppModule {}
