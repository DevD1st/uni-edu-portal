import assert from "node:assert/strict";
import test from "node:test";
import type { AdminGrant } from "@uemp/api-contracts";
import {
  permits,
  permitsSomewhere,
  canDelegate,
  canProvisionLecturer,
  reviewRule,
  type Privilege,
  type Rule,
} from "../src/features/access/policy.ts";

function grant(departmentId: string | null, ...privileges: Privilege[]): AdminGrant {
  return {
    id: "grant",
    roleId: "role",
    name: "Custom",
    systemKey: null,
    departmentId,
    privileges,
  };
}

test("a compound rule needs every privilege in the same department", () => {
  const rule: Rule = { anyOf: [["read_registration", "manage_department"]] };
  assert.equal(
    permitsSomewhere(
      [grant("a", "read_registration"), grant("b", "manage_department")],
      rule,
    ),
    false,
  );
  assert.equal(
    permitsSomewhere(
      [grant(null, "read_registration"), grant("b", "manage_department")],
      rule,
    ),
    true,
  );
});

test("approval alone permits review in its assigned department", () => {
  const grants = [grant("a", "approve_result")];
  assert.equal(permits(grants, reviewRule, "a"), true);
  assert.equal(permits(grants, reviewRule, "b"), false);
  assert.equal(permitsSomewhere([grant("a", "teach_course")], reviewRule), false);
});

test("a university-wide workspace requires an unscoped grant", () => {
  const rule: Rule = { anyOf: [["read_audit"]], global: true };
  assert.equal(permitsSomewhere([grant("a", "read_audit")], rule), false);
  assert.equal(permitsSomewhere([grant(null, "read_audit")], rule), true);
});

test("registration oversight requires an unscoped university management grant", () => {
  const rule: Rule = { anyOf: [["read_registration", "manage_university"]] };
  assert.equal(
    permitsSomewhere([grant("a", "read_registration", "manage_university")], rule),
    false,
  );
  assert.equal(
    permitsSomewhere(
      [grant("a", "read_registration"), grant(null, "manage_university")],
      rule,
    ),
    true,
  );
});

test("a role can only carry privileges the assigner holds for its chosen scope", () => {
  const grants = [
    grant(null, "read_user"),
    grant("a", "read_reports"),
    grant("b", "manage_department"),
  ];
  assert.equal(canDelegate(grants, ["read_user", "read_reports"], "a"), true);
  assert.equal(canDelegate(grants, ["read_user", "read_reports"], null), false);
  assert.equal(canDelegate(grants, ["read_reports", "manage_department"], "b"), false);
});

test("lecturer provisioning requires both privileges on the scoped HOD grant", () => {
  const hod: AdminGrant = {
    ...grant("a", "create_admin", "manage_department"),
    systemKey: "hod",
  };
  assert.equal(canProvisionLecturer([hod], "a"), true);
  assert.equal(canProvisionLecturer([hod], "b"), false);
  assert.equal(
    canProvisionLecturer([grant("a", "create_admin", "manage_department")], "a"),
    false,
  );
  assert.equal(
    canProvisionLecturer(
      [{ ...hod, privileges: ["create_admin"] }, grant("a", "manage_department")],
      "a",
    ),
    false,
  );
});
