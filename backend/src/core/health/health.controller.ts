import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../cache/redis.module.js';
import { LOG_PROVIDER, LogService } from '../logging/services/log.service.js';
import {
  LivenessResponseDto,
  ReadinessResponseDto,
} from './health-response.dto.js';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly database: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(LOG_PROVIDER) private readonly log: LogService,
  ) {
    log.setContext(HealthController.name);
  }

  @Get('live')
  @ApiOkResponse({ type: LivenessResponseDto })
  live(): LivenessResponseDto {
    return new LivenessResponseDto();
  }

  @Get('ready')
  @ApiOkResponse({ type: ReadinessResponseDto })
  async ready(): Promise<ReadinessResponseDto> {
    const [postgres, redis] = await Promise.allSettled([
      this.database.query('SELECT 1'),
      this.redis.ping(),
    ]);
    if (postgres.status !== 'fulfilled' || redis.status !== 'fulfilled') {
      this.log.warn('Readiness dependency failed', {
        postgres: postgres.status,
        redis: redis.status,
      });
      throw new ServiceUnavailableException();
    }
    return new ReadinessResponseDto();
  }
}
