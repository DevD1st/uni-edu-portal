import { Inject, Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { CommandBus, QueryBus, UnhandledExceptionBus } from '@nestjs/cqrs';
import { metrics, SpanStatusCode, trace } from '@opentelemetry/api';
import { LOG_PROVIDER, LogService } from '../logging/services/log.service.js';

type ExecutionBus = { execute(message: object): Promise<unknown> };

@Injectable()
export class CqrsTelemetryService implements OnModuleInit {
  private readonly meter = metrics.getMeter('uemp-api');
  private readonly duration = this.meter.createHistogram('uemp.cqrs.duration', {
    unit: 'ms',
  });
  private readonly tracer = trace.getTracer('uemp-api');

  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
    private readonly exceptions: UnhandledExceptionBus,
    @Inject(LOG_PROVIDER) private readonly log: LogService,
  ) {
    log.setContext(CqrsTelemetryService.name);
  }

  onModuleInit(): void {
    this.wrap(this.commands as ExecutionBus, 'command');
    this.wrap(this.queries as ExecutionBus, 'query');
    this.exceptions.subscribe(({ exception, cause }) => {
      this.log.error('Asynchronous handler failed', {
        messageType: cause?.constructor?.name,
        errorType: exception instanceof Error ? exception.name : 'UnknownError',
      });
    });
  }

  private wrap(bus: ExecutionBus, kind: 'command' | 'query'): void {
    const execute = bus.execute.bind(bus);
    bus.execute = (message) =>
      this.tracer.startActiveSpan(
        'cqrs.' + message.constructor.name,
        async (span) => {
          const started = performance.now();
          const messageType = message.constructor.name;
          let outcome = 'succeeded';
          try {
            return await execute(message);
          } catch (error: unknown) {
            outcome = 'failed';
            span.setStatus({ code: SpanStatusCode.ERROR });
            throw error;
          } finally {
            const durationMs = Math.round(performance.now() - started);
            this.duration.record(durationMs, { kind, messageType, outcome });
            this.log.debug('CQRS operation finished', {
              kind,
              messageType,
              outcome,
              durationMs,
            });
            span.end();
          }
        },
      );
  }
}
