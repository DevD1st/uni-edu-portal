import { Global, Inject, Injectable, Module } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';
import { requiredEnv } from '../config/env.js';
import { LOG_PROVIDER, LogService } from '../logging/services/log.service.js';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Injectable()
class RedisLifecycle implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}
  onApplicationShutdown(): void {
    this.client.disconnect();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [LOG_PROVIDER],
      useFactory: async (log: LogService) => {
        log.setContext('Redis');
        const client = new Redis(requiredEnv('REDIS_URL'), {
          lazyConnect: true,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
          connectTimeout: 5000,
        });
        client.on('error', (error: Error) =>
          log.error('Redis connection error', { errorType: error.name }),
        );
        client.on('ready', () => log.log('Redis connection ready'));
        try {
          await client.connect();
          return client;
        } catch (error: unknown) {
          client.disconnect();
          throw error;
        }
      },
    },
    RedisLifecycle,
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
