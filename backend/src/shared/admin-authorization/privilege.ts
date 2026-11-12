export const PRIVILEGES = [
  'read_user',
  'create_student',
  'update_student_placement',
  'update_user',
  'suspend_user',
  'delete_user',
  'revoke_user_sessions',
  'read_admin',
  'create_admin',
  'manage_admin_roles',
  'read_role',
  'manage_roles',
  'read_audit',
  'manage_university',
  'manage_department',
  'read_registration',
  'register_student_courses',
  'teach_course',
  'grade_result',
  'approve_result',
  'review_result',
  'reopen_result',
  'read_reports',
] as const;

export type Privilege = (typeof PRIVILEGES)[number];

export interface AdminGrant {
  id: string;
  roleId: string;
  name: string;
  systemKey: 'super_admin' | 'hod' | 'lecturer' | null;
  departmentId: string | null;
  privileges: Privilege[];
}

export interface AdminAccess {
  adminId: string;
  grants: AdminGrant[];
}

export function hasPrivilege(
  access: AdminAccess,
  privilege: Privilege,
  departmentId?: string | null,
): boolean {
  // A department and privilege must come from the same assignment.
  return access.grants.some(
    (grant) =>
      grant.privileges.includes(privilege) &&
      (grant.departmentId === null || grant.departmentId === departmentId),
  );
}

export function hasAnyScope(
  access: AdminAccess,
  privilege: Privilege,
): boolean {
  return access.grants.some((grant) => grant.privileges.includes(privilege));
}

export function hasGlobalSuperAdmin(access: AdminAccess): boolean {
  // The protected system key identifies this role; names and broad custom grants do not.
  return access.grants.some(
    (grant) => grant.systemKey === 'super_admin' && grant.departmentId === null,
  );
}

export function canManageLecturerProfile(
  actor: AdminAccess,
  grants: readonly {
    departmentId: string | null;
    privileges: readonly string[];
  }[],
): boolean {
  // A lecturer has one profile shared by every assignment, so every grant must be in scope.
  return (
    grants.some(({ privileges }) => privileges.includes('teach_course')) &&
    grants.every(
      ({ departmentId }) =>
        departmentId !== null &&
        hasPrivilege(actor, 'update_user', departmentId) &&
        hasPrivilege(actor, 'manage_department', departmentId),
    )
  );
}

export function authorizedDepartments(
  access: AdminAccess,
  privilege: Privilege,
): string[] | null {
  const scopes = access.grants
    .filter((grant) => grant.privileges.includes(privilege))
    .map((grant) => grant.departmentId);
  return scopes.includes(null)
    ? null
    : [...new Set(scopes.filter((id): id is string => id !== null))];
}
