import { ApplicationError } from '#core/http/application-error.js';
import { Inject, Injectable, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { validate as isUuid } from 'uuid';
import {
  LOG_PROVIDER,
  LogService,
} from '#core/logging/services/log.service.js';
import { intEnv, requiredEnv } from '#core/config/env.js';
import type {
  AccountPrincipal,
  AccountRole,
} from '#shared/auth/account-context.js';
import {
  AdvanceAuthVersionCommand,
  FindAccountCredentialsQuery,
  GetAuthAccountQuery,
} from '#shared/auth/user.contracts.js';
import type { AuthAccount } from '#shared/auth/user.contracts.js';
import { hashPassword, matchesPassword } from '#shared/auth/password.js';
import type { SessionResponseDto } from '../dtos/auth-response.dto.js';
import { TokenRegistryService } from './token-registry.service.js';

interface TokenClaims extends AccountPrincipal {
  type: 'access' | 'refresh';
}

const TOKEN_ISSUER = 'uemp-api';
const TOKEN_AUDIENCE = 'uemp-client';

@Injectable()
export class AuthenticationService {
  private readonly secrets = {
    access: requiredEnv('ACCESS_TOKEN_SECRET', 32),
    refresh: requiredEnv('REFRESH_TOKEN_SECRET', 32),
  };
  private readonly lifetimes = {
    access: intEnv('ACCESS_TOKEN_TTL_SECONDS', 900),
    refresh: intEnv('REFRESH_TOKEN_TTL_SECONDS', 604800),
  };
  private readonly dummyHash = hashPassword(randomUUID());

  constructor(
    private readonly commands: CommandBus,
    private readonly queries: QueryBus,
    private readonly registry: TokenRegistryService,
    @Inject(LOG_PROVIDER) private readonly log: LogService,
  ) {
    log.setContext(AuthenticationService.name);
  }

  async signIn(
    email: string,
    password: string,
    role: AccountRole,
  ): Promise<SessionResponseDto> {
    const account = await this.queries.execute(
      new FindAccountCredentialsQuery(email.trim().toLowerCase(), role),
    );
    // Do equivalent password work when an account does not exist.
    const valid = await matchesPassword(
      password,
      account?.hashedPassword ?? (await this.dummyHash),
    );
    if (!account || !valid) {
      this.log.warn('Account sign-in rejected', { role });
      throw new ApplicationError(
        HttpStatus.UNAUTHORIZED,
        'Check your email, password, and account type and try again.',
      );
    }
    const tokens = await this.issue(
      await this.commands.execute(
        new AdvanceAuthVersionCommand(account.id, account.authVersion),
      ),
    );
    this.log.log('Account signed in', { userId: account.id, role });
    return tokens;
  }

  async refresh(token: string): Promise<SessionResponseDto> {
    const decoded = this.decode(token, 'refresh');
    await this.current(decoded);
    if (
      !(await this.registry.claimRefresh(
        decoded.userId,
        decoded.jti,
        decoded.authVersion,
      ))
    ) {
      this.log.warn('Refresh token claim rejected', { userId: decoded.userId });
      throw new ApplicationError(
        HttpStatus.UNAUTHORIZED,
        'This session can no longer be renewed. Sign in again.',
      );
    }
    const account = await this.commands.execute(
      new AdvanceAuthVersionCommand(decoded.userId, decoded.authVersion),
    );
    const tokens = await this.issue(account);
    this.log.log('Account session rotated', { userId: account.id });
    return tokens;
  }

  async authenticate(token: string): Promise<AccountPrincipal> {
    const decoded = this.decode(token, 'access');
    await this.current(decoded);
    if (!(await this.registry.hasAccess(decoded)))
      throw new ApplicationError(
        HttpStatus.UNAUTHORIZED,
        'This session is no longer active. Sign in again.',
      );
    const { type: _type, ...account } = decoded;
    return account;
  }

  async logout(account: AccountPrincipal): Promise<void> {
    // Race refresh against the same database version so a successful logout ends the family.
    await this.commands.execute(
      new AdvanceAuthVersionCommand(account.userId, account.authVersion),
    );
    try {
      await this.registry.revoke(account);
    } catch {
      // The registry logs its failure. PostgreSQL has already revoked the pair.
    }
    this.log.log('Account signed out', { userId: account.userId });
  }

  private async current(claims: TokenClaims): Promise<void> {
    const account = await this.queries.execute(
      new GetAuthAccountQuery(claims.userId),
    );
    if (
      !account ||
      account.authVersion !== claims.authVersion ||
      account.role !== claims.role
    ) {
      throw new ApplicationError(
        HttpStatus.UNAUTHORIZED,
        'This session is no longer active. Sign in again.',
      );
    }
  }

  private decode(token: string, type: TokenClaims['type']): TokenClaims {
    try {
      const payload = jwt.verify(token, this.secrets[type], {
        algorithms: ['HS256'],
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
      });
      if (
        typeof payload === 'string' ||
        payload.type !== type ||
        typeof payload.sub !== 'string' ||
        !isUuid(payload.sub) ||
        typeof payload.jti !== 'string' ||
        !isUuid(payload.jti) ||
        typeof payload.refreshJti !== 'string' ||
        !isUuid(payload.refreshJti) ||
        (type === 'refresh' && payload.jti !== payload.refreshJti) ||
        (payload.role !== 'student' && payload.role !== 'admin') ||
        !Number.isSafeInteger(payload.authVersion) ||
        payload.authVersion < 1 ||
        typeof payload.exp !== 'number'
      ) {
        throw new Error('Invalid token claims');
      }
      return {
        userId: payload.sub,
        jti: payload.jti,
        refreshJti: payload.refreshJti,
        role: payload.role,
        authVersion: payload.authVersion,
        type,
      };
    } catch {
      throw new ApplicationError(
        HttpStatus.UNAUTHORIZED,
        'This session is no longer active. Sign in again.',
      );
    }
  }

  private async issue(account: AuthAccount): Promise<SessionResponseDto> {
    const accessJti = randomUUID();
    const refreshJti = randomUUID();
    const family = { authVersion: account.authVersion, accessJti, refreshJti };
    const issuedAt = Math.floor(Date.now() / 1000);
    const sign = (type: TokenClaims['type'], jti: string) => ({
      token: jwt.sign(
        {
          type,
          role: account.role,
          authVersion: account.authVersion,
          refreshJti,
          iat: issuedAt,
        },
        this.secrets[type],
        {
          algorithm: 'HS256',
          issuer: TOKEN_ISSUER,
          audience: TOKEN_AUDIENCE,
          subject: account.id,
          jwtid: jti,
          expiresIn: this.lifetimes[type],
        },
      ),
      expiresAt: (issuedAt + this.lifetimes[type]) * 1000,
    });
    const tokens = {
      access: sign('access', accessJti),
      refresh: sign('refresh', refreshJti),
    };
    if (
      !(await this.registry.publish(
        account.id,
        family,
        this.lifetimes.access,
        this.lifetimes.refresh,
      ))
    ) {
      throw new ApplicationError(
        HttpStatus.UNAUTHORIZED,
        'Your session has changed. Sign in again.',
      );
    }
    return tokens;
  }
}
