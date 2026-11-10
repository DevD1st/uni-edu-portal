import assert from "node:assert/strict";
import test from "node:test";
import type { AdminGrant } from "@uemp/api-contracts";
import {
  permits,
  permitsSomewhere,
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
