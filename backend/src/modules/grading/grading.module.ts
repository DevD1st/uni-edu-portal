import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradingPolicy } from './entity/grading-policies.entity.js';
import { GradeSystem } from './entity/grade-systems.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([GradingPolicy, GradeSystem])],
})
export class GradingModule {}
