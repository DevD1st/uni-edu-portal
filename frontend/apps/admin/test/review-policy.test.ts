import assert from "node:assert/strict";
import test from "node:test";
import type { AdminGrant } from "@uemp/api-contracts";
import { reviewActions } from "../src/features/review/policy.ts";

function grant(departmentId: string | null): AdminGrant {
  return {
    id: "grant",
    roleId: "role",
    name: "Department reviewer",
    systemKey: null,
    departmentId,
    privileges: ["approve_result", "review_result", "reopen_result"],
  };
}

test("server self-approval restrictions preserve other permitted review actions", () => {
  const group = { departmentId: "a", status: "submitted", canApprove: false } as const;
  assert.deepEqual(reviewActions([grant("a")], group), {
    approve: false,
    correct: true,
    reopen: true,
  });
  assert.equal(
    reviewActions([grant("a")], { ...group, canApprove: true }).approve,
    true,
  );
});

test("server eligibility cannot bypass approval scope or the submitted state", () => {
  const group = { departmentId: "a", status: "submitted", canApprove: true } as const;
  assert.equal(reviewActions([grant("b")], group).approve, false);
  assert.equal(reviewActions([], group).approve, false);
  assert.equal(
    reviewActions([grant(null)], { ...group, status: "approved" }).approve,
    false,
  );
  assert.equal(reviewActions([grant(null)], group).approve, true);
});
