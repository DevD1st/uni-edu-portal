import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResultGroup } from './entity/result-groups.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ResultGroup])],
})
export class ResultsModule {}
