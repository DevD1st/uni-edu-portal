import { randomUUID } from 'node:crypto';
import { trace } from '@opentelemetry/api';
import type { NextFunction, Request, Response } from 'express';
import { requestContext } from '#core/logging/request-context.js';
import type { LogService } from '#core/logging/services/log.service.js';

export function requestLogging(log: LogService) {
  return (request: Request, response: Response, next: NextFunction): void => {
    // Generate IDs at this boundary so untrusted headers never become durable log fields.
    const requestId = randomUUID();
    const traceId = trace.getActiveSpan()?.spanContext().traceId;
    const started = performance.now();
    response.setHeader('x-request-id', requestId);
    if (traceId) response.setHeader('x-trace-id', traceId);
    const record = (aborted: boolean) => {
      const fields = {
        requestId,
        traceId,
        method: request.method,
        route:
          typeof request.route?.path === 'string'
            ? request.route.path
            : undefined,
        status: response.statusCode,
        durationMs: Math.round(performance.now() - started),
      };
      if (aborted || response.statusCode >= 400) {
        log.warn(
          aborted ? 'HTTP request disconnected' : 'HTTP request rejected',
          fields,
        );
      } else if (
        request.path !== '/health/live' &&
        request.path !== '/health/ready'
      ) {
        log.log('HTTP request completed', fields);
      }
    };
    response.once('finish', () => record(false));
    response.once('close', () => {
      if (!response.writableFinished) record(true);
    });
    requestContext.run({ requestId, traceId }, next);
  };
}
