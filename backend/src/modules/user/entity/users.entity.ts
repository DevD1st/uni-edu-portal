import { Check, Column, DeleteDateColumn, Entity, Unique } from 'typeorm';
import { Exclude } from 'class-transformer';
import { MutableRecord } from '#core/database/base.entity.js';

@Entity('users')
@Check('chk_users_role', "\"role\" IN ('student', 'admin')")
@Check(
  'chk_users_email_valid',
  '"email" = lower(btrim("email")) AND length("email") BETWEEN 1 AND 254',
)
@Check('chk_users_auth_version_valid', '"auth_version" >= 0')
@Check('chk_users_status', "\"status\" IN ('active', 'suspended')")
@Unique('uq_users_email_role', ['email', 'role'])
@Check(
  'chk_users_password_state',
  '("deleted_at" IS NULL AND "hashed_password" IS NOT NULL) OR ("deleted_at" IS NOT NULL AND "hashed_password" IS NULL AND "first_name" IS NULL AND "last_name" IS NULL AND "email" = \'deleted-\' || replace("id"::text, \'-\', \'\') || \'@redacted.invalid\')',
)
export class User extends MutableRecord {
  /** Stores the given name shown on the account profile. */
  @Column({ name: 'first_name', type: 'text', nullable: true })
  firstName!: string | null;

  /** Stores the family name shown on the account profile. */
  @Column({ name: 'last_name', type: 'text', nullable: true })
  lastName!: string | null;

  /** Distinguishes student and administrator login identities. */
  @Column({ name: 'role', type: 'text', update: false })
  role!: 'student' | 'admin';

  /** Holds the normalized login address or its redacted placeholder. */
  @Column({ name: 'email', type: 'text' })
  email!: string;

  /** Holds the password verifier until account deletion. */
  @Exclude()
  @Column({
    name: 'hashed_password',
    type: 'text',
    nullable: true,
    select: false,
  })
  hashedPassword!: string | null;

  /** Advances when tokens are issued or revoked so stale sessions fail validation. */
  @Exclude()
  @Column({ name: 'auth_version', type: 'integer', select: false, default: 0 })
  authVersion!: number;

  /** Records completion of account redaction and prevents future authentication. */
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  /** Allows an account to be suspended without removing its academic history. */
  @Column({ name: 'status', type: 'text', default: 'active' })
  status!: 'active' | 'suspended';
}
