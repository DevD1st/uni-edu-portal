import { useState } from "react";
import { Link } from "react-router";
import { ResourceState, Surface } from "@uemp/ui";
import { permits, reviewRule } from "../../access/policy";
import {
  ChoiceField,
  namedOptions,
  StaffResource,
} from "../../portal/components/staff-controls";
import { staffPath, useStaffAccess, useStaffResource } from "../../portal/staff-data";

function Submissions({ departmentId }: { departmentId: string }) {
  const resource = useStaffResource(
    staffPath("/v1/admin/results", { departmentId, status: "submitted", limit: "3" }),
    "ResultGroupPageDto",
  );
  return (
    <StaffResource resource={resource} title="submitted results">
      {({ items, nextCursor }) => (
        <>
          {items.length ? (
            <ul className="staff-summary-list">
              {items.map((group) => (
                <li key={group.id}>
                  <Link
                    className="u-text-link"
                    to={"/workspaces/result-review/" + group.id}
                  >
                    {group.code} · {group.name}
                  </Link>
                  <p className="u-muted">
                    {group.markedCount} of {group.enrolledCount} marks complete
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <ResourceState
              state="empty"
              title="No results awaiting review in this department"
            />
          )}
          {nextCursor && (
            <p className="u-muted">
              More submitted results are available in the review queue.
            </p>
          )}
          <Link
            className="u-text-link"
            to={staffPath("/workspaces/result-review", { departmentId })}
          >
            Open departmental review
          </Link>
        </>
      )}
    </StaffResource>
  );
}

export function ReviewSummary() {
  const { grants } = useStaffAccess();
  const resource = useStaffResource(
    "/v1/admin/results/options",
    "ResultReviewOptionsDto",
  );
  const [selected, select] = useState("");
  return (
    <Surface className="u-stack" aria-label="Review dashboard">
      <h2>Awaiting departmental review</h2>
      <StaffResource resource={resource} title="review departments">
        {({ departments }) => {
          const eligible = departments.filter(({ id }) =>
            permits(grants, reviewRule, id),
          );
          const departmentId =
            eligible.find(({ id }) => id === selected)?.id ?? eligible[0]?.id;
          if (!departmentId)
            return (
              <ResourceState state="empty" title="No departments available to review" />
            );
          return (
            <>
              <ChoiceField
                label="Review department"
                value={departmentId}
                options={namedOptions(eligible)}
                emptyLabel={null}
                onChange={(event) => select(event.target.value)}
              />
              <Submissions key={departmentId} departmentId={departmentId} />
            </>
          );
        }}
      </StaffResource>
    </Surface>
  );
}
