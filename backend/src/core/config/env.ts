export type Environment = 'development' | 'staging' | 'production' | 'test';

export function environment(): Environment {
  const value = process.env.APP_ENV ?? process.env.NODE_ENV ?? 'development';
  if (
    value === 'development' ||
    value === 'staging' ||
    value === 'production' ||
    value === 'test'
  )
    return value;
  throw new Error('APP_ENV must be development, staging, production, or test');
}

export function requiredEnv(key: string, minimumLength = 1): string {
  const value = process.env[key];
  if (!value || value.length < minimumLength)
    throw new Error(key + ' is missing or too short');
  return value;
}

export function intEnv(
  key: string,
  fallback: number,
  maximum = 2_147_483_647,
): number {
  const value = process.env[key] ?? String(fallback);
  const parsed = Number(value);
  if (
    !/^\d+$/.test(value) ||
    !Number.isSafeInteger(parsed) ||
    parsed < 1 ||
    parsed > maximum
  ) {
    throw new Error(key + ' must be a positive integer in range');
  }
  return parsed;
}

export function validateRuntimeConfig(): void {
  environment();
  intEnv('PORT', 3000, 65535);
  requiredEnv('POSTGRES_PASSWORD');
  const redisUrl = new URL(requiredEnv('REDIS_URL'));
  if (redisUrl.protocol !== 'redis:' && redisUrl.protocol !== 'rediss:') {
    throw new Error('REDIS_URL must use redis or rediss');
  }
  if (
    requiredEnv('ACCESS_TOKEN_SECRET', 32) ===
    requiredEnv('REFRESH_TOKEN_SECRET', 32)
  ) {
    throw new Error('Access and refresh token signing secrets must differ');
  }
  if (
    intEnv('ACCESS_TOKEN_TTL_SECONDS', 900) >=
    intEnv('REFRESH_TOKEN_TTL_SECONDS', 604800)
  ) {
    throw new Error(
      'Refresh token lifetime must exceed the access token lifetime',
    );
  }
}
