import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseOptions } from './database/ormconfig.js';
import { LogsModule } from './logging/logs.module.js';
import { RedisModule } from './cache/redis.module.js';
import { CqrsTelemetryService } from './telemetry/cqrs-telemetry.service.js';
import { HealthController } from './health/health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    CqrsModule.forRoot(),
    TypeOrmModule.forRootAsync({ useFactory: databaseOptions }),
    LogsModule,
    RedisModule,
  ],
  controllers: [HealthController],
  providers: [CqrsTelemetryService],
})
export class CoreModule {}
