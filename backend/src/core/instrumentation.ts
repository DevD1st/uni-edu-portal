import { register } from 'node:module';
import { environment } from './config/env.js';

export async function startInstrumentation() {
  // Development and staging stay logs-only even if exporter variables leak in.
  if (
    environment() !== 'production' ||
    !process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  )
    return undefined;

  process.env.OTEL_SERVICE_NAME ??= 'uemp-api';
  process.env.OTEL_LOGS_EXPORTER = 'none';
  process.env.OTEL_TRACES_EXPORTER ??= 'otlp';
  process.env.OTEL_METRICS_EXPORTER ??= 'otlp';
  register('@opentelemetry/instrumentation/hook.mjs', import.meta.url);
  const [{ NodeSDK }, { getNodeAutoInstrumentations }] = await Promise.all([
    import('@opentelemetry/sdk-node'),
    import('@opentelemetry/auto-instrumentations-node'),
  ]);
  const sdk = new NodeSDK({
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-pg': {
          enhancedDatabaseReporting: false,
        },
        '@opentelemetry/instrumentation-ioredis': { enabled: false },
      }),
    ],
  });
  sdk.start();
  return sdk;
}
