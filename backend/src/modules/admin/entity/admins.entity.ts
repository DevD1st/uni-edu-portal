import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { MutableRecord } from '#core/database/base.entity.js';
import type { User } from '#modules/user/entity/users.entity.js';
import type { AdminRole } from '#modules/admin/entity/admin-roles.entity.js';

@Entity('admins')
export class Admin extends MutableRecord {
  /** Links the profile to its administrator login account. */
  @Column({ name: 'user_id', type: 'uuid', update: false })
  userId!: string;

  @OneToOne('User', { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_admins_user_id',
  })
  user?: User;

  /** Identifies the creator or stays null for bootstrap. */
  @Column({ name: 'created_by_admin_id', type: 'uuid', nullable: true })
  createdByAdminId!: string | null;

  @ManyToOne('Admin', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'created_by_admin_id',
    foreignKeyConstraintName: 'fk_admins_created_by_admin_id',
  })
  createdByAdmin?: Admin | null;

  @OneToMany('AdminRole', 'admin')
  adminRoles?: AdminRole[];
}
