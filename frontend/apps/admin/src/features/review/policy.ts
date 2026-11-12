import type { AdminGrant } from "@uemp/api-contracts";
import type { Dto } from "@uemp/api-contracts/response";
import { hasPrivilege } from "../access/policy.ts";

type ReviewState = Pick<
  Dto<"ResultGroupDetailDto">,
  "status" | "departmentId" | "canApprove"
>;

export function reviewActions(grants: readonly AdminGrant[], group: ReviewState) {
  const submitted = group.status === "submitted";
  return {
    // The API owns contribution checks and the Super Admin exception.
    approve:
      submitted &&
      group.canApprove &&
      hasPrivilege(grants, "approve_result", group.departmentId),
    correct: submitted && hasPrivilege(grants, "review_result", group.departmentId),
    reopen:
      (submitted || group.status === "approved") &&
      hasPrivilege(grants, "reopen_result", group.departmentId),
  };
}
