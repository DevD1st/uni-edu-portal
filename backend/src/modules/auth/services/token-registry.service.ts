import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '#core/cache/redis.module.js';
import {
  LOG_PROVIDER,
  LogService,
} from '#core/logging/services/log.service.js';
import type { AccountPrincipal } from '#shared/auth/account-context.js';

interface Family {
  authVersion: number;
  accessJti: string;
  refreshJti: string;
}

const publishFamily = `
  local previous = redis.call('GET', KEYS[1])
  if previous then
    local version, access, refresh = string.match(previous, '^(%d+):([^:]+):([^:]+)$')
    if version then
      if tonumber(version) >= tonumber(ARGV[1]) then return 0 end
      redis.call('DEL', ARGV[2] .. 'access:' .. access, ARGV[2] .. 'refresh:' .. refresh)
    end
  end
  redis.call('SET', KEYS[2], ARGV[3], 'EX', ARGV[4])
  redis.call('SET', KEYS[3], ARGV[3], 'EX', ARGV[5])
  redis.call('SET', KEYS[1], ARGV[3], 'EX', ARGV[5])
  return 1
`;

const revokeFamily = `
  local value = redis.call('GET', KEYS[1])
  if not value then return 0 end
  local version, access, refresh = string.match(value, '^(%d+):([^:]+):([^:]+)$')
  if not version or tonumber(version) >= tonumber(ARGV[1]) then return 0 end
  redis.call('DEL', KEYS[1], ARGV[2] .. 'access:' .. access, ARGV[2] .. 'refresh:' .. refresh)
  return 1
`;

const revokePair = `
  local value = redis.call('GET', KEYS[1])
  if value then
    local _, _, refresh = string.match(value, '^(%d+):([^:]+):([^:]+)$')
    if refresh == ARGV[1] then redis.call('DEL', KEYS[1]) end
  end
  return redis.call('DEL', KEYS[2], KEYS[3])
`;

@Injectable()
export class TokenRegistryService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(LOG_PROVIDER) private readonly log: LogService,
  ) {
    log.setContext(TokenRegistryService.name);
  }

  async publish(
    userId: string,
    family: Family,
    accessTtl: number,
    refreshTtl: number,
  ): Promise<boolean> {
    const prefix = tokenPrefix(userId);
    // A slower response from an earlier sign-in cannot replace a newer family.
    return (
      (await this.run('publish', () =>
        this.redis.eval(
          publishFamily,
          3,
          prefix + 'current',
          prefix + 'access:' + family.accessJti,
          prefix + 'refresh:' + family.refreshJti,
          family.authVersion,
          prefix,
          encodeFamily(family),
          accessTtl,
          refreshTtl,
        ),
      )) === 1
    );
  }

  async hasAccess(account: AccountPrincipal): Promise<boolean> {
    const prefix = tokenPrefix(account.userId);
    const [access, refresh] = await this.run('access check', () =>
      this.redis.mget(
        prefix + 'access:' + account.jti,
        prefix + 'refresh:' + account.refreshJti,
      ),
    );
    const family = {
      authVersion: account.authVersion,
      accessJti: account.jti,
      refreshJti: account.refreshJti,
    };
    return access === encodeFamily(family) && access === refresh;
  }

  async claimRefresh(
    userId: string,
    refreshJti: string,
    version: number,
  ): Promise<boolean> {
    // GETDEL makes the refresh token single-use across concurrent requests.
    const raw = await this.run('refresh claim', () =>
      this.redis.getdel(tokenPrefix(userId) + 'refresh:' + refreshJti),
    );
    if (!raw) return false;
    const [storedVersion, , storedRefresh, extra] = raw.split(':');
    return (
      extra === undefined &&
      storedVersion === String(version) &&
      storedRefresh === refreshJti
    );
  }

  async revoke(account: AccountPrincipal): Promise<void> {
    const prefix = tokenPrefix(account.userId);
    await this.run('logout', () =>
      this.redis.eval(
        revokePair,
        3,
        prefix + 'current',
        prefix + 'access:' + account.jti,
        prefix + 'refresh:' + account.refreshJti,
        account.refreshJti,
      ),
    );
  }

  async removeOlderThan(userId: string, authVersion: number): Promise<void> {
    const prefix = tokenPrefix(userId);
    await this.run('account revocation', () =>
      this.redis.eval(revokeFamily, 1, prefix + 'current', authVersion, prefix),
    );
  }

  private async run<T>(
    operation: string,
    action: () => Promise<T>,
  ): Promise<T> {
    try {
      return await action();
    } catch (error: unknown) {
      this.log.error('Token registry operation failed', {
        operation,
        errorType: error instanceof Error ? error.name : 'UnknownError',
      });
      throw new ServiceUnavailableException();
    }
  }
}

function tokenPrefix(userId: string): string {
  return 'uemp:auth:v1:{' + userId + '}:';
}

function encodeFamily(family: Family): string {
  return [family.authVersion, family.accessJti, family.refreshJti].join(':');
}
