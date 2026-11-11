import { Link } from "react-router";
import { ResourceState, Surface } from "@uemp/ui";
import { StaffMetrics } from "../../portal/components/staff-metrics";
import { hasPrivilege } from "../../access/policy";
import { StaffResource } from "../../portal/components/staff-controls";
import { useStaffAccess, useStaffResource } from "../../portal/staff-data";

export function TeachingSummary() {
  const { grants } = useStaffAccess();
  const resource = useStaffResource(
    "/v1/lecturer/offerings",
    "TeachingOfferingsResponseDto",
  );
  return (
    <Surface className="u-stack staff-summary-card" aria-label="Teaching dashboard">
      <h2>Your teaching</h2>
      <p className="u-muted">Across the course offerings assigned to you.</p>
      <StaffResource resource={resource} title="teaching summary">
        {({ offerings }) => {
          const assigned = offerings.filter(({ departmentId }) =>
            hasPrivilege(grants, "teach_course", departmentId),
          );
          return (
            <>
              <StaffMetrics
                items={[
                  { label: "Assigned offerings", value: assigned.length },
                  {
                    label: "Registration open",
                    value: assigned.filter(
                      ({ registrationStatus }) => registrationStatus === "opened",
                    ).length,
                  },
                  {
                    label: "Registration closed",
                    value: assigned.filter(
                      ({ registrationStatus }) => registrationStatus === "closed",
                    ).length,
                  },
                ]}
              />
              {assigned.length ? (
                <ul className="staff-summary-list">
                  {assigned.slice(0, 3).map((offering) => (
                    <li key={offering.offeringId}>
                      <Link
                        className="u-text-link"
                        to={"/workspaces/teaching/" + offering.offeringId}
                      >
                        {offering.code} · {offering.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <ResourceState state="empty" title="No course offerings assigned yet" />
              )}
              <Link className="u-text-link" to="/workspaces/teaching">
                Open my teaching
              </Link>
            </>
          );
        }}
      </StaffResource>
    </Surface>
  );
}
