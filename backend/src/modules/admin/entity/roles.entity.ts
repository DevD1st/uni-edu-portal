import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';
import type { Admin } from '#modules/admin/entity/admins.entity.js';
import type { AdminRole } from '#modules/admin/entity/admin-roles.entity.js';

@Entity('roles')
@Check(
  'chk_roles_name_valid',
  '"name" ~ \'^[a-z0-9]+(-[a-z0-9]+)*$\' AND length("name") <= 80',
)
@Check('chk_roles_kind', "\"kind\" IN ('custom', 'system')")
@Check(
  'chk_roles_system_key',
  "\"system_key\" IN ('super_admin', 'hod', 'lecturer')",
)
@Unique('uq_roles_name', ['name'])
@Unique('uq_roles_system_key', ['systemKey'])
@Check(
  'chk_roles_system_key_kind',
  '("kind" = \'system\' AND "system_key" IS NOT NULL) OR ("kind" = \'custom\' AND "system_key" IS NULL)',
)
@Check(
  'chk_roles_privileges',
  "\"privileges\" <@ ARRAY['read_user', 'create_student', 'update_student_placement', 'update_user', 'suspend_user', 'delete_user', 'revoke_user_sessions', 'read_admin', 'create_admin', 'manage_admin_roles', 'read_role', 'manage_roles', 'read_audit', 'manage_university', 'manage_department', 'read_registration', 'register_student_courses', 'teach_course', 'grade_result', 'approve_result', 'review_result', 'reopen_result', 'read_reports']::text[] AND array_position(\"privileges\", NULL) IS NULL",
)
export class Role extends MutableRecord {
  /** Stores a unique lowercase role name, such as hod, lecturer, or ict-manager. */
  @Column({ name: 'name', type: 'text' })
  name!: string;

  /** Explains the purpose of a role in the admin directory. */
  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  /** Distinguishes protected system roles from custom roles. */
  @Column({ name: 'kind', type: 'text', update: false })
  kind!: 'custom' | 'system';

  /** Keeps a stable key for a seeded system role. */
  @Column({ name: 'system_key', type: 'text', nullable: true, update: false })
  systemKey!: 'super_admin' | 'hod' | 'lecturer' | null;

  /** Identifies who created a custom role. */
  @Column({ name: 'created_by_admin_id', type: 'uuid', nullable: true })
  createdByAdminId!: string | null;

  @ManyToOne('Admin', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'created_by_admin_id',
    foreignKeyConstraintName: 'fk_roles_created_by_admin_id',
  })
  createdByAdmin?: Admin | null;

  /** Lists the catalog capabilities supplied by the role. */
  @Column({
    name: 'privileges',
    type: 'text',
    array: true,
    default: [],
  })
  privileges!: string[];

  @OneToMany('AdminRole', 'role')
  adminRoles?: AdminRole[];
}
