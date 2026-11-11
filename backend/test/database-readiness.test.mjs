import assert from 'node:assert/strict';
import test from 'node:test';
import { waitForDatabase } from '../dist/core/database/wait-for-database.js';

test('initialization waits through temporary DNS and PostgreSQL startup failures', async () => {
  const codes = ['EAI_AGAIN', 'ECONNREFUSED', '57P03'];
  let attempts = 0;
  await waitForDatabase(
    async (attemptTimeoutMs) => {
      assert.ok(attemptTimeoutMs > 0 && attemptTimeoutMs <= 2000);
      const code = codes[attempts++];
      if (code)
        throw Object.assign(new Error('private connection details'), { code });
    },
    { timeoutMs: 5000, retryDelayMs: 1 },
  );
  assert.equal(attempts, 4);
});

test('incorrect database credentials fail immediately without revealing driver details', async () => {
  let attempts = 0;
  await assert.rejects(
    waitForDatabase(
      async () => {
        attempts += 1;
        throw Object.assign(new Error('private credentials'), {
          code: '28P01',
        });
      },
      { timeoutMs: 5000, retryDelayMs: 1 },
    ),
    (error) => {
      assert.match(error.message, /Check the database settings/);
      assert.doesNotMatch(error.message, /private credentials/);
      return true;
    },
  );
  assert.equal(attempts, 1);
});

test('pg client timeouts without a server error code are retried', async () => {
  let attempts = 0;
  await waitForDatabase(
    async () => {
      if (attempts++ === 0) throw new Error('Query read timeout');
    },
    { timeoutMs: 5000, retryDelayMs: 1 },
  );
  assert.equal(attempts, 2);
});

test('initialization stops with a friendly error when PostgreSQL never becomes ready', async () => {
  await assert.rejects(
    waitForDatabase(
      async () => {
        throw Object.assign(new Error('private host'), { code: 'EAI_AGAIN' });
      },
      { timeoutMs: 25, retryDelayMs: 5 },
    ),
    (error) => {
      assert.match(
        error.message,
        /did not become ready within the startup timeout/,
      );
      assert.doesNotMatch(error.message, /private host/);
      return true;
    },
  );
});
