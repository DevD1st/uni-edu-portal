import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CreatedRecord } from '#core/database/base.entity.js';
import type { CourseOfStudy } from '#modules/academic-reference/entity/courses-of-study.entity.js';
import type { Course } from '#modules/course/entity/courses.entity.js';

@Entity('course_of_study_courses')
@Unique('uq_course_of_study_courses_course_of_study_id_course_id', [
  'courseOfStudyId',
  'courseId',
])
export class CourseOfStudyCourse extends CreatedRecord {
  /** Identifies the programme that includes the course. */
  @Column({ name: 'course_of_study_id', type: 'uuid', update: false })
  courseOfStudyId!: string;

  @ManyToOne('CourseOfStudy', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'course_of_study_id',
    foreignKeyConstraintName: 'fk_course_of_study_courses_course_of_study_id',
  })
  courseOfStudy?: CourseOfStudy;

  /** Identifies the shared catalog course in the programme. */
  @Column({ name: 'course_id', type: 'uuid', update: false })
  courseId!: string;

  @ManyToOne('Course', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'course_id',
    foreignKeyConstraintName: 'fk_course_of_study_courses_course_id',
  })
  course?: Course;
}
