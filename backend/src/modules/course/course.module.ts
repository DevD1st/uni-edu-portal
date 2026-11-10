import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseSetupService } from './services/course-setup.service.js';
import { CourseSetupController } from './controllers/course-setup.controller.js';
import { ReadCourseSetupHandler } from './queries/handlers/read-course-setup/read-course-setup.handler.js';
import { ListLecturerChoicesHandler } from './queries/handlers/list-lecturer-choices/list-lecturer-choices.handler.js';
import { SaveCourseHandler } from './commands/handlers/save-course/save-course.handler.js';
import { AddCurriculumCourseHandler } from './commands/handlers/add-curriculum-course/add-curriculum-course.handler.js';
import { RemoveCurriculumCourseHandler } from './commands/handlers/remove-curriculum-course/remove-curriculum-course.handler.js';
import { CreateOfferingHandler } from './commands/handlers/create-offering/create-offering.handler.js';
import { UpdateOfferingHandler } from './commands/handlers/update-offering/update-offering.handler.js';
import { Course } from './entity/courses.entity.js';
import { CourseOfStudyCourse } from './entity/course-of-study-courses.entity.js';
import { CourseOffering } from './entity/course-offerings.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseOfStudyCourse, CourseOffering]),
  ],
  controllers: [CourseSetupController],
  providers: [
    CourseSetupService,
    ReadCourseSetupHandler,
    ListLecturerChoicesHandler,
    SaveCourseHandler,
    AddCurriculumCourseHandler,
    RemoveCurriculumCourseHandler,
    CreateOfferingHandler,
    UpdateOfferingHandler,
  ],
})
export class CourseModule {}
