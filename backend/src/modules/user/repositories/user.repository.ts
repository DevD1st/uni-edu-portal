import { databaseWrite } from '#core/database/database-write.js';
import { ApplicationError } from '#core/http/application-error.js';
import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import type { EntityManager } from 'typeorm';
import type { AccountRole } from '#shared/auth/account-context.js';
import type {
  AuthAccount,
  AccountCredentials,
} from '#shared/auth/user.contracts.js';
import { User } from '../entity/users.entity.js';

export interface IUserRepository {
  findCredentials(
    email: string,
    role: AccountRole,
  ): Promise<AccountCredentials | null>;
  getAuthAccount(userId: string): Promise<AuthAccount | null>;
  advanceAuthVersion(
    userId: string,
    expectedVersion: number,
  ): Promise<AuthAccount>;
  lockUser(
    manager: EntityManager,
    userId: string,
    includeDeleted?: boolean,
  ): Promise<User>;
}

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly database: DataSource) {}

  async findCredentials(
    email: string,
    role: AccountRole,
  ): Promise<AccountCredentials | null> {
    const user = await this.database
      .getRepository(User)
      .createQueryBuilder('account')
      .addSelect(['account.hashedPassword', 'account.authVersion'])
      .where(
        'account.email = :email AND account.role = :role AND account.status = :status',
        { email, role, status: 'active' },
      )
      .getOne();
    return user?.hashedPassword
      ? {
          id: user.id,
          role: user.role,
          authVersion: user.authVersion,
          hashedPassword: user.hashedPassword,
        }
      : null;
  }

  async getAuthAccount(userId: string): Promise<AuthAccount | null> {
    return this.database.getRepository(User).findOne({
      select: { id: true, role: true, authVersion: true },
      where: { id: userId, status: 'active' },
    });
  }

  async advanceAuthVersion(
    userId: string,
    expectedVersion: number,
  ): Promise<AuthAccount> {
    // Compare and increment together. A stale login or refresh cannot replace a newer token family.
    const result = await databaseWrite(() =>
      this.database
        .getRepository(User)
        .createQueryBuilder()
        .update()
        .set({ authVersion: () => '"auth_version" + 1' })
        .where({
          id: userId,
          authVersion: expectedVersion,
          status: 'active',
          deletedAt: IsNull(),
        })
        .returning(['id', 'role', 'authVersion'])
        .execute(),
    );
    const account = result.raw[0] as
      | { id: string; role: AccountRole; auth_version: number }
      | undefined;
    if (!account)
      throw new ApplicationError(
        HttpStatus.UNAUTHORIZED,
        'Your session has changed. Sign in again.',
      );
    return {
      id: account.id,
      role: account.role,
      authVersion: account.auth_version,
    };
  }

  async lockUser(
    manager: EntityManager,
    userId: string,
    includeDeleted = false,
  ): Promise<User> {
    const query = manager
      .getRepository(User)
      .createQueryBuilder('account')
      .addSelect(['account.hashedPassword', 'account.authVersion'])
      .where('account.id = :userId', { userId })
      .setLock('pessimistic_write');
    if (includeDeleted) query.withDeleted();
    const user = await query.getOne();
    if (!user)
      throw new ApplicationError(HttpStatus.NOT_FOUND, 'Account was not found');
    return user;
  }
}
