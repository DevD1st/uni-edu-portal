import { ApplicationError } from '#core/http/application-error.js';
import { Injectable, HttpStatus } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import type { EntityManager } from 'typeorm';
import { GetAdminAuthorizationQuery } from './contracts.js';
import { hasAnyScope, hasPrivilege } from './privilege.js';
import type { AdminAccess, Privilege } from './privilege.js';

@Injectable()
export class AdminAuthorizationService {
  constructor(private readonly queries: QueryBus) {}

  async resolve(userId: string, manager?: EntityManager): Promise<AdminAccess> {
    const access = await this.queries.execute(
      new GetAdminAuthorizationQuery(userId, manager),
    );
    if (!access)
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        'Administrator access is required',
      );
    return access;
  }

  async require(
    userId: string,
    privilege: Privilege,
    departmentId?: string | null,
    manager?: EntityManager,
  ): Promise<AdminAccess> {
    const access = await this.resolve(userId, manager);
    if (!hasPrivilege(access, privilege, departmentId))
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        departmentId
          ? 'You do not have permission to do this in the selected department.'
          : 'You do not have university-wide permission to perform this action.',
      );
    return access;
  }

  async requireAnyScope(
    userId: string,
    privilege: Privilege,
  ): Promise<AdminAccess> {
    const access = await this.resolve(userId);
    if (!hasAnyScope(access, privilege))
      throw new ApplicationError(
        HttpStatus.FORBIDDEN,
        'You do not have permission to perform this action.',
      );
    return access;
  }
}
