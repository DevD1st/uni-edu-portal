import { databaseWrite } from '#core/database/database-write.js';
import { ApplicationError } from '#core/http/application-error.js';
import { Injectable, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { DeepPartial, EntityManager } from 'typeorm';
import { validate as isUuid } from 'uuid';
import { AdminAuditEvent } from '../entity/admin-audit-events.entity.js';
import type { ListAuditEventsDto } from '../dtos/admin-audit.dto.js';

export interface IAdminAuditRepository {
  append(event: DeepPartial<AdminAuditEvent>): Promise<void>;
  appendInTransaction(
    manager: EntityManager,
    events: DeepPartial<AdminAuditEvent>[],
  ): Promise<void>;
  find(id: string): Promise<AdminAuditEvent | null>;
  list(
    input: ListAuditEventsDto,
  ): Promise<{ items: AdminAuditEvent[]; nextCursor: string | null }>;
}

@Injectable()
export class AdminAuditRepository implements IAdminAuditRepository {
  constructor(private readonly database: DataSource) {}

  async append(input: DeepPartial<AdminAuditEvent>): Promise<void> {
    const repository = this.database.getRepository(AdminAuditEvent);
    await databaseWrite(() =>
      repository.save(repository.create(input), { reload: false }),
    );
  }

  async appendInTransaction(
    manager: EntityManager,
    events: DeepPartial<AdminAuditEvent>[],
  ): Promise<void> {
    if (!events.length) return;
    const repository = manager.getRepository(AdminAuditEvent);
    await databaseWrite(() =>
      repository.save(repository.create(events), { reload: false, chunk: 200 }),
    );
  }

  find(id: string): Promise<AdminAuditEvent | null> {
    return this.database.getRepository(AdminAuditEvent).findOneBy({ id });
  }

  async list(input: ListAuditEventsDto) {
    const query = this.database
      .getRepository(AdminAuditEvent)
      .createQueryBuilder('event')
      // PostgreSQL keeps more precision than Date. Preserve it so a page never skips tied events.
      .addSelect(
        `to_char(event.occurred_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`,
        'cursor_time',
      )
      .orderBy('event.occurredAt', 'DESC')
      .addOrderBy('event.id', 'DESC')
      .take(input.limit + 1);
    const filterKeys = [
      'actorAdminId',
      'actorUserId',
      'action',
      'category',
      'outcome',
      'targetId',
    ] as const;
    for (const key of filterKeys) {
      if (input[key])
        query.andWhere('event.' + key + ' = :' + key, { [key]: input[key] });
    }
    if (input.from)
      query.andWhere('event.occurredAt >= :from', { from: input.from });
    if (input.to) query.andWhere('event.occurredAt <= :to', { to: input.to });
    if (input.cursor) {
      const { time, id } = decodeCursor(input.cursor);
      query.andWhere(
        '(event.occurred_at, event.id) < (CAST(:time AS timestamptz), CAST(:id AS uuid))',
        { time, id },
      );
    }
    const result = await query.getRawAndEntities<{ cursor_time: string }>();
    const items = result.entities.slice(0, input.limit);
    const nextCursor =
      result.entities.length > input.limit
        ? Buffer.from(
            result.raw[input.limit - 1].cursor_time + '/' + items.at(-1)!.id,
          ).toString('base64url')
        : null;
    return { items, nextCursor };
  }
}

function decodeCursor(value: string) {
  const [time, id, extra] = Buffer.from(value, 'base64url')
    .toString('utf8')
    .split('/');
  if (
    !time ||
    !id ||
    extra !== undefined ||
    !isUuid(id) ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(time) ||
    !Number.isFinite(Date.parse(time))
  ) {
    throw new ApplicationError(
      HttpStatus.BAD_REQUEST,
      'Use the cursor from the previous page, or omit it to start again.',
    );
  }
  return { time, id };
}
