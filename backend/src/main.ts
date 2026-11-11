import '#core/config/load-env.js';
import { startInstrumentation } from './core/instrumentation.js';

const telemetry = await startInstrumentation();
try {
  const { bootstrap } = await import('./bootstrap.js');
  await bootstrap(telemetry);
} catch (error: unknown) {
  // Startup errors can contain connection strings. Emit only a safe classification.
  console.error(
    JSON.stringify({
      level: 'error',
      message: 'Backend startup failed',
      errorType: error instanceof Error ? error.name : 'UnknownError',
    }),
  );
  await telemetry?.shutdown().catch(() => undefined);
  process.exit(1);
}
