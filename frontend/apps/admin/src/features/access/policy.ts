import type { AdminGrant } from "@uemp/api-contracts";

type Grants = readonly AdminGrant[];
export type Privilege = AdminGrant["privileges"][number];
export type Rule = { anyOf: readonly (readonly Privilege[])[]; global?: boolean };
export const reviewRule: Rule = {
  anyOf: [["review_result"], ["approve_result"], ["reopen_result"]],
};

function hasPrivilege(grants: Grants, privilege: Privilege, department: string | null) {
  return grants.some(
    (grant) =>
      grant.privileges.includes(privilege) &&
      // The backend checks university management without a department scope.
      (grant.departmentId === null ||
        (privilege !== "manage_university" && grant.departmentId === department)),
  );
}

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
