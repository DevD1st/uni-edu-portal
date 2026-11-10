import { Query } from '@nestjs/cqrs';
import type { EntityManager } from 'typeorm';
import type { AdminAccess } from './privilege.js';

export class GetAdminAuthorizationQuery extends Query<AdminAccess | null> {
  constructor(
    readonly userId: string,
    readonly manager?: EntityManager,
  ) {
    super();
  }
}
