import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { databaseOptions } from '#core/database/ormconfig.js';
import { waitForDatabase } from '#core/database/wait-for-database.js';

async function runStep(label: string, file: URL, args: string[] = []) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [fileURLToPath(file), ...args], {
      stdio: 'inherit',
    });
    child.once('error', () => reject(new Error(`Could not start ${label}.`)));
    child.once('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} failed. Check the initialization log.`));
    });
  });
}

try {
  const options = databaseOptions();
  if (options.type !== 'postgres')
    throw new Error('Initialization requires a PostgreSQL database.');
  console.log('Waiting for PostgreSQL before running migrations and seeding.');
  await waitForDatabase(async (attemptTimeoutMs) => {
    const client = new pg.Client({
      host: options.host,
      port: options.port,
      user: options.username,
      password: options.password,
      database: options.database,
      connectionTimeoutMillis: attemptTimeoutMs,
      query_timeout: attemptTimeoutMs,
      statement_timeout: attemptTimeoutMs,
    });
    // Connect/query reject on failure; late socket errors during cleanup must not crash PID 1.
    client.on('error', () => undefined);
    try {
      await client.connect();
      await client.query('SELECT 1');
    } finally {
      await client.end().catch(() => undefined);
    }
  });
  console.log('PostgreSQL is ready; applying pending migrations.');
  await runStep(
    'Database migration',
    new URL('../node_modules/typeorm/cli.js', import.meta.url),
    [
      '-d',
      fileURLToPath(new URL('./core/database/ormconfig.js', import.meta.url)),
      'migration:run',
    ],
  );
  // Seed completion commits with the records, so retries never depend on container files.
  console.log('Migrations completed; checking demo initialization.');
  await runStep('Demo seeding', new URL('./demo/seed.js', import.meta.url));
  console.log('Database initialization completed.');
} catch (error: unknown) {
  console.error(
    'Database initialization failed. ' +
      (error instanceof Error
        ? error.message
        : 'Check the initialization log.'),
  );
  process.exitCode = 1;
}
