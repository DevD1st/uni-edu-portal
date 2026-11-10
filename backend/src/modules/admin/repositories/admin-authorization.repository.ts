import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { EntityManager } from 'typeorm';
import type {
  AdminAccess,
  AdminGrant,
} from '#shared/admin-authorization/privilege.js';

export interface IAdminAuthorizationRepository {
  findByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<AdminAccess | null>;
}

@Injectable()
export class AdminAuthorizationRepository
  implements IAdminAuthorizationRepository
{
  constructor(private readonly database: DataSource) {}

  async findByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<AdminAccess | null> {
    const connection = manager ?? this.database.manager;
    // Read from PostgreSQL so a revoked grant cannot remain usable through a cache.
    const [admin] = (await connection.query(
      `SELECT a.id FROM admins a JOIN users u ON u.id = a.user_id
        WHERE a.user_id = $1 AND u.role = 'admin' AND u.status = 'active' AND u.deleted_at IS NULL
        ${manager ? 'FOR SHARE OF a, u' : ''}`,
      [userId],
    )) as { id: string }[];
    if (!admin) return null;

    const grants = (await connection.query(
      `SELECT g.id, g.role_id AS "roleId", r.name, r.system_key AS "systemKey",
              g.department_id AS "departmentId", r.privileges
         FROM admin_roles g JOIN roles r ON r.id = g.role_id
        WHERE g.admin_id = $1 ORDER BY g.id ${manager ? 'FOR SHARE OF g, r' : ''}`,
      [admin.id],
    )) as AdminGrant[];
    return { adminId: admin.id, grants };
  }
}
