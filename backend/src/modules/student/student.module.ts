import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entity/students.entity.js';
import { MatricNumSystem } from './entity/matric-num-systems.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Student, MatricNumSystem])],
})
export class StudentModule {}
