import { Query } from '@nestjs/cqrs';
import type {
  UserResponseDto,
  UserPageResponseDto,
} from '#shared/auth/user-response.dto.js';
import type { DirectoryQueryDto } from '#shared/http/directory.dto.js';

export class GetUserProfileQuery extends Query<UserResponseDto> {
  constructor(
    readonly userId: string,
    readonly actorUserId?: string,
    readonly populate?: string,
  ) {
    super();
  }
}

export class ListUsersQuery extends Query<UserPageResponseDto> {
  constructor(
    readonly actorUserId: string,
    readonly input: DirectoryQueryDto,
  ) {
    super();
  }
}
