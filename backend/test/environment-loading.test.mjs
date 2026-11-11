import assert from 'node:assert/strict';
import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  environmentFile,
  loadEnvironment,
} from '../dist/core/config/load-env.js';

async function removeFixture(directory) {
  const resolved = await realpath(directory);
  assert.equal(dirname(resolved), await realpath(tmpdir()));
  assert.ok(basename(resolved).startsWith('uemp-env-loading-'));
  await rm(resolved, { recursive: true, force: true });
}

test('the shared environment path is anchored at the repository root', () => {
  assert.equal(
    environmentFile,
    fileURLToPath(new URL('../../.env', import.meta.url)),
  );
});

test('root settings load without replacing injected container or shell variables', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'uemp-env-loading-'));
  try {
    const file = join(directory, '.env');
    await writeFile(
      file,
      'POSTGRES_HOST=127.0.0.1\nUEMP_ENV_TEST="value with spaces"\n',
    );
    const target = { POSTGRES_HOST: 'postgres' };
    loadEnvironment(file, target);
    assert.equal(target.POSTGRES_HOST, 'postgres');
    assert.equal(target.UEMP_ENV_TEST, 'value with spaces');
  } finally {
    await removeFixture(directory);
  }
});

test('an image without an environment file keeps its injected values', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'uemp-env-loading-'));
  try {
    const target = { POSTGRES_HOST: 'postgres' };
    loadEnvironment(join(directory, 'missing.env'), target);
    assert.deepEqual(target, { POSTGRES_HOST: 'postgres' });
  } finally {
    await removeFixture(directory);
  }
});
