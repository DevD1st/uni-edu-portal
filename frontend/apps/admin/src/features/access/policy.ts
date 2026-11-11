import type { AdminGrant } from "@uemp/api-contracts";

type Grants = readonly AdminGrant[];
export type Privilege = AdminGrant["privileges"][number];
export type Rule = { anyOf: readonly (readonly Privilege[])[]; global?: boolean };
export const reviewRule: Rule = {
  anyOf: [["review_result"], ["approve_result"], ["reopen_result"]],
};

export function hasPrivilege(
  grants: Grants,
  privilege: Privilege,
  department: string | null,
) {
  return grants.some(
    (grant) =>
      grant.privileges.includes(privilege) &&
      // The backend checks university management without a department scope.
      (grant.departmentId === null ||
        (privilege !== "manage_university" && grant.departmentId === department)),
  );
}

export function canDelegate(
  grants: Grants,
  privileges: readonly string[],
  department: string | null,
) {
  // Delegation checks the original grant scope for every privilege, even for a university-only action.
  return privileges.every((privilege) =>
    grants.some(
      (grant) =>
        (grant.departmentId === null || grant.departmentId === department) &&
        grant.privileges.some((item) => item === privilege),
    ),
  );
}

export function canProvisionLecturer(grants: Grants, department: string) {
  return grants.some(
    (grant) =>
      grant.systemKey === "hod" &&
      grant.departmentId === department &&
      grant.privileges.includes("create_admin") &&
      grant.privileges.includes("manage_department"),
  );
}

export const registrationOversight: Rule = {
  anyOf: [
    ["read_registration", "manage_department"],
    ["read_registration", "manage_university"],
  ],
};

export function permits(grants: Grants, rule: Rule, department: string | null) {
  if (rule.global && department !== null) return false;
  return rule.anyOf.some((group) =>
    group.every((privilege) => hasPrivilege(grants, privilege, department)),
  );
}

export function permitsSomewhere(grants: Grants, rule: Rule) {
  return (
    permits(grants, rule, null) ||
    (!rule.global &&
      grants.some(
        ({ departmentId }) =>
          departmentId !== null && permits(grants, rule, departmentId),
      ))
  );
}
