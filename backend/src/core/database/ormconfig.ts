import 'reflect-metadata';
import '../config/load-env.js';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import { intEnv, requiredEnv } from '../config/env.js';
import { DatabaseNamingStrategy } from './naming-strategy.js';

export function databaseOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST ?? '127.0.0.1',
    port: intEnv('POSTGRES_PORT', 5432, 65535),
    database: process.env.POSTGRES_DB ?? 'uemp',
    username: process.env.POSTGRES_USER ?? 'uemp',
    password: requiredEnv('POSTGRES_PASSWORD'),
    connectTimeoutMS: 5000,
    extra: { max: intEnv('POSTGRES_POOL_MAX', 10, 100) },
    entities: [
      fileURLToPath(new URL('../../modules/**/*.entity.js', import.meta.url)),
    ],
    migrations: [fileURLToPath(new URL('./migrations/*.js', import.meta.url))],
    namingStrategy: new DatabaseNamingStrategy(),
    synchronize: false,
    migrationsRun: false,
    migrationsTransactionMode: 'all',
  };
}

export default new DataSource(databaseOptions());
