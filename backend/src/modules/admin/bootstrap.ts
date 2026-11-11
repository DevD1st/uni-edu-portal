import '#core/config/load-env.js';
import { writeTransaction } from '#core/database/database-write.js';
import { isEmail } from 'class-validator';
import database from '#core/database/ormconfig.js';
import { requiredEnv } from '#core/config/env.js';
import { hashPassword } from '#shared/auth/password.js';
import type { User } from '#modules/user/entity/users.entity.js';
import { Admin } from './entity/admins.entity.js';
import { AdminRole } from './entity/admin-roles.entity.js';
import { Role } from './entity/roles.entity.js';

try {
  const email = requiredEnv('BOOTSTRAP_ADMIN_EMAIL').trim().toLowerCase();
  if (
    !isEmail(email) ||
    email.length > 254 ||
    email.endsWith('@redacted.invalid')
  ) {
    throw new Error('Invalid bootstrap email');
  }
  const hashedPassword = await hashPassword(
    requiredEnv('BOOTSTRAP_ADMIN_PASSWORD', 12),
  );
  await database.initialize();
  const adminId = await writeTransaction(database, async (manager) => {
    // Serialize bootstrap so simultaneous deployments cannot create separate initial administrators.
    await manager.query('SELECT pg_advisory_xact_lock($1)', [1_758_209_031]);
    const [existing] = await manager.query(`
      SELECT a.id FROM admins a JOIN users u ON u.id = a.user_id
      JOIN admin_roles g ON g.admin_id = a.id JOIN roles r ON r.id = g.role_id
      WHERE r.system_key = 'super_admin' AND g.department_id IS NULL
        AND u.deleted_at IS NULL AND u.status = 'active' LIMIT 1
    `);
    if (existing) return null;

    const role = await manager
      .getRepository(Role)
      .findOneByOrFail({ systemKey: 'super_admin' });
    const users = manager.getRepository<User>('User');
    const user = await users.save(
      users.create({ role: 'admin', email, hashedPassword }),
    );
    const admins = manager.getRepository(Admin);
    const admin = await admins.save(
      admins.create({ userId: user.id, createdByAdminId: null }),
    );
    const grants = manager.getRepository(AdminRole);
    await grants.save(
      grants.create({
        adminId: admin.id,
        roleId: role.id,
        departmentId: null,
        assignedByAdminId: null,
      }),
    );
    return admin.id;
  });
  console.log(
    JSON.stringify({
      level: 'info',
      message: adminId
        ? 'Initial administrator created'
        : 'Active Super Admin already exists',
      adminId,
    }),
  );
} catch (error: unknown) {
  console.error(
    JSON.stringify({
      level: 'error',
      message: 'Administrator bootstrap failed',
      errorType: error instanceof Error ? error.name : 'UnknownError',
    }),
  );
  process.exitCode = 1;
} finally {
  if (database.isInitialized) await database.destroy();
}
