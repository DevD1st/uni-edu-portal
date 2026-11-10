import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { CreatedRecord } from '#core/database/base.entity.js';
import type { Admin } from '#modules/admin/entity/admins.entity.js';
import type { Role } from '#modules/admin/entity/roles.entity.js';
import type { Department } from '#modules/academic-reference/entity/departments.entity.js';

@Entity('admin_roles')
@Index('uq_admin_roles_global', ['adminId', 'roleId'], {
  unique: true,
  where: '"department_id" IS NULL',
})
@Index('uq_admin_roles_department', ['adminId', 'roleId', 'departmentId'], {
  unique: true,
  where: '"department_id" IS NOT NULL',
})
export class AdminRole extends CreatedRecord {
  /** Identifies the administrator receiving the grant. */
  @Column({ name: 'admin_id', type: 'uuid', update: false })
  adminId!: string;

  @ManyToOne('Admin', 'adminRoles', { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'admin_id',
    foreignKeyConstraintName: 'fk_admin_roles_admin_id',
  })
  admin?: Admin;

  /** Links the grant to its role name and privileges. */
  @Column({ name: 'role_id', type: 'uuid', update: false })
  roleId!: string;

  @ManyToOne('Role', 'adminRoles', { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'role_id',
    foreignKeyConstraintName: 'fk_admin_roles_role_id',
  })
  role?: Role;

  /** Identifies the admin who granted the assignment. */
  @Column({ name: 'assigned_by_admin_id', type: 'uuid', nullable: true })
  assignedByAdminId!: string | null;

  @ManyToOne('Admin', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'assigned_by_admin_id',
    foreignKeyConstraintName: 'fk_admin_roles_assigned_by_admin_id',
  })
  assignedByAdmin?: Admin | null;

  /** Restricts all privileges from this grant to one department when present. */
  @Column({
    name: 'department_id',
    type: 'uuid',
    nullable: true,
    update: false,
  })
  departmentId!: string | null;

  @ManyToOne('Department', { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'department_id',
    foreignKeyConstraintName: 'fk_admin_roles_department_id',
  })
  department?: Department | null;
}
