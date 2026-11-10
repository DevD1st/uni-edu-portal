import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import type { Request } from 'express';
import { Redis } from 'ioredis';
import { requiredEnv } from '#core/config/env.js';
import { REDIS_CLIENT } from '#core/cache/redis.module.js';
import {
  LOG_PROVIDER,
  LogService,
} from '#core/logging/services/log.service.js';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(LOG_PROVIDER) private readonly log: LogService,
  ) {
    log.setContext(AuthRateLimitGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const address = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const addressKey = createHmac(
      'sha256',
      requiredEnv('ACCESS_TOKEN_SECRET', 32),
    )
      .update(address)
      .digest('hex');
    const key =
      'uemp:auth:rate:v1:' + context.getHandler().name + ':' + addressKey;
    let count: unknown;
    try {
      count = await this.redis.eval(
        "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], 60) end; return n",
        1,
        key,
      );
    } catch {
      this.log.error('Authentication rate limit store unavailable');
      throw new ServiceUnavailableException();
    }
    if (Number(count) > 30) {
      this.log.warn('Authentication rate limit exceeded', {
        operation: context.getHandler().name,
      });
      throw new HttpException(
        'Too many authentication requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
