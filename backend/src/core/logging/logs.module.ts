import { Global, Module } from '@nestjs/common';
import { LOG_PROVIDER, LogService } from './services/log.service.js';

@Global()
@Module({
  providers: [{ provide: LOG_PROVIDER, useClass: LogService }],
  exports: [LOG_PROVIDER],
})
export class LogsModule {}
