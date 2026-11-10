import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entity/courses.entity.js';
import { CourseOfStudyCourse } from './entity/course-of-study-courses.entity.js';
import { CourseOffering } from './entity/course-offerings.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseOfStudyCourse, CourseOffering]),
  ],
})
export class CourseModule {}
