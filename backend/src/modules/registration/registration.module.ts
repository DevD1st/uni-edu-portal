import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentRegisterSemester } from './entity/student-register-semesters.entity.js';
import { StudentRegisteredCourse } from './entity/student-registered-courses.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentRegisterSemester,
      StudentRegisteredCourse,
    ]),
  ],
})
export class RegistrationModule {}
