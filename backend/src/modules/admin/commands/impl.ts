import { Command } from '@nestjs/cqrs';
import type {
  AssignAdminRoleDto,
  CreateAdminDto,
  WriteRoleDto,
} from '../dtos/admin-write.dto.js';
import type {
  CreatedAdminResponseDto,
  RoleAssignmentResponseDto,
  RoleResponseDto,
} from '../dtos/admin-response.dto.js';

export class CreateAdminCommand extends Command<CreatedAdminResponseDto> {
  constructor(
    readonly actorUserId: string,
    readonly input: CreateAdminDto,
  ) {
    super();
  }
}
export class SaveRoleCommand extends Command<RoleResponseDto> {
  constructor(
    readonly actorUserId: string,
    readonly input: WriteRoleDto,
    readonly roleId?: string,
  ) {
    super();
  }
}
export class DeleteRoleCommand extends Command<void> {
  constructor(
    readonly actorUserId: string,
    readonly roleId: string,
  ) {
    super();
  }
}
export class AssignAdminRoleCommand extends Command<RoleAssignmentResponseDto> {
  constructor(
    readonly actorUserId: string,
    readonly adminId: string,
    readonly input: AssignAdminRoleDto,
  ) {
    super();
  }
}
export class RevokeAdminRoleCommand extends Command<void> {
  constructor(
    readonly actorUserId: string,
    readonly adminId: string,
    readonly grantId: string,
  ) {
    super();
  }
}
