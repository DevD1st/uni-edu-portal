import { Command } from '@nestjs/cqrs';
import type { PlacementDto } from '#shared/auth/student-account.dto.js';
import type { UserResponseDto } from '#shared/auth/user-response.dto.js';
import type { UpdateUserDto } from '../dtos/user-write.dto.js';

export class UpdateUserProfileCommand extends Command<UserResponseDto> {
  constructor(
    readonly userId: string,
    readonly input: UpdateUserDto,
    readonly actorUserId?: string,
  ) {
    super();
  }
}

export class ChangePasswordCommand extends Command<void> {
  constructor(
    readonly userId: string,
    readonly currentPassword: string,
    readonly newPassword: string,
  ) {
    super();
  }
}

export class UpdateStudentPlacementCommand extends Command<UserResponseDto> {
  constructor(
    readonly actorUserId: string,
    readonly userId: string,
    readonly input: PlacementDto,
  ) {
    super();
  }
}

export class ManageUserStatusCommand extends Command<UserResponseDto> {
  constructor(
    readonly actorUserId: string,
    readonly userId: string,
    readonly status: 'active' | 'suspended',
  ) {
    super();
  }
}

export class RevokeUserSessionsCommand extends Command<void> {
  constructor(
    readonly actorUserId: string,
    readonly userId: string,
  ) {
    super();
  }
}

export class DeleteUserAccountCommand extends Command<void> {
  constructor(
    readonly userId: string,
    readonly actorUserId?: string,
  ) {
    super();
  }
}
