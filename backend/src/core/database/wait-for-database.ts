import { setTimeout as pause } from 'node:timers/promises';

const temporaryFailures = new Set([
  'EAI_AGAIN',
  'ENOTFOUND',
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  '57P01',
  '57P02',
  '57P03',
  '57014',
]);
// The pg client reports its own socket/query timeouts without a PostgreSQL code.
const temporaryClientMessages = new Set([
  'timeout expired',
  'Query read timeout',
  'Connection terminated',
  'Connection terminated unexpectedly',
]);

export async function waitForDatabase(
  probe: (attemptTimeoutMs: number) => Promise<void>,
  { timeoutMs = 60_000, retryDelayMs = 500 } = {},
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await probe(Math.max(1, Math.min(2000, deadline - Date.now())));
      return;
    } catch (error: unknown) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : undefined;
      // A plain Compose restart does not wait for dependency health or DNS.
      // Retry readiness failures, but never hide a bad password or configuration.
      const temporary = code
        ? temporaryFailures.has(code)
        : error instanceof Error && temporaryClientMessages.has(error.message);
      if (!temporary)
        throw new Error(
          'Could not connect to PostgreSQL. Check the database settings and try again.',
        );
    }
    const remaining = deadline - Date.now();
    if (remaining > 0) await pause(Math.min(retryDelayMs, remaining));
  }
  throw new Error(
    'PostgreSQL did not become ready within the startup timeout. Check the database service and try again.',
  );
}
