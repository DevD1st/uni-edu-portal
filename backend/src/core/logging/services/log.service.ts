import { Injectable, Scope } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { createLogger, format, transports } from 'winston';
import { environment } from '../../config/env.js';
import { requestContext } from '../request-context.js';

export const LOG_PROVIDER = Symbol('LOG_PROVIDER');
type Fields = Record<string, string | number | boolean | undefined>;
const logger = createLogger({
  level: environment() === 'production' ? 'info' : 'debug',
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});

@Injectable({ scope: Scope.TRANSIENT })
export class LogService implements LoggerService {
  private context = 'Nest';

  setContext(context: string): void {
    this.context = context;
  }
  log(message: unknown, fields?: unknown): void {
    this.write('info', message, fields);
  }
  warn(message: unknown, fields?: unknown): void {
    this.write('warn', message, fields);
  }
  error(message: unknown, fields?: unknown): void {
    this.write('error', message, fields);
  }
  debug(message: unknown, fields?: unknown): void {
    this.write('debug', message, fields);
  }

  private write(level: string, message: unknown, fields?: unknown): void {
    // Domain callers pass allowlisted fields. Never serialize a raw framework error.
    const data =
      fields && typeof fields === 'object' && !(fields instanceof Error)
        ? (fields as Fields)
        : {};
    logger.log(
      level,
      typeof message === 'string' ? message : 'Framework event',
      {
        ...data,
        service: this.context,
        ...requestContext.getStore(),
        traceId:
          trace.getActiveSpan()?.spanContext().traceId ??
          requestContext.getStore()?.traceId,
        environment: environment(),
      },
    );
  }
}
