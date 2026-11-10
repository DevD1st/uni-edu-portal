import { ApplicationError } from '#core/http/application-error.js';
import { HttpStatus } from '@nestjs/common';
import bcrypt from 'bcrypt';

const HASH_COST = 12;

export function validatePasswordBytes(password: string): void {
  // Bcrypt ignores bytes beyond 72, so accepting them would make distinct passwords equivalent.
  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new ApplicationError(
      HttpStatus.BAD_REQUEST,
      'Choose a shorter password. Passwords can use up to 72 bytes.',
    );
  }
}

export async function hashPassword(password: string): Promise<string> {
  validatePasswordBytes(password);
  return bcrypt.hash(password, HASH_COST);
}

export async function matchesPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return (
    Buffer.byteLength(password, 'utf8') <= 72 && bcrypt.compare(password, hash)
  );
}
