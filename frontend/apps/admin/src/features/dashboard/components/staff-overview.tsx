import { Link } from "react-router";
import { PageHeader, ResourceState, Surface } from "@uemp/ui";
import { permitsSomewhere, reviewRule } from "../../access/policy";
import { useStaffAccess } from "../../portal/staff-data";
import { workspaceGroups, workspacePath } from "../../portal/workspaces";
import { AcademicSummary } from "./academic-summary";
import { ReviewSummary } from "./review-summary";
import { TeachingSummary } from "./teaching-summary";

export function StaffOverview() {
  const { grants } = useStaffAccess();
  const workspaces = workspaceGroups.flatMap(({ items }) =>
    items.filter(({ rule }) => permitsSomewhere(grants, rule)),
  );
  return (
    <>
      <PageHeader
        eyebrow="University workspace"
        title="Staff overview"
        description="Your teaching, departmental decisions, and academic activity within your assigned access."
      />
      <div className="staff-grid">
        {permitsSomewhere(grants, { anyOf: [["teach_course"]] }) && <TeachingSummary />}
        {permitsSomewhere(grants, reviewRule) && <ReviewSummary />}
        {permitsSomewhere(grants, { anyOf: [["read_reports"]] }) && <AcademicSummary />}
      </div>
      {workspaces.length ? (
        <section className="u-stack" aria-label="Available workspaces">
          <h2>Your workspaces</h2>
          <div className="staff-grid">
            {workspaces.map((workspace) => (
              <Link
                className="staff-card"
                key={workspace.slug}
                to={workspacePath(workspace)}
              >
                <Surface className="u-stack">
                  <workspace.icon size={25} aria-hidden />
                  <h3>{workspace.label}</h3>
                  <p>{workspace.description}</p>
                </Surface>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <Surface>
          <ResourceState
            state="empty"
            title="No staff workspaces assigned"
            detail="Ask a university administrator to review your access if you need a workspace."
          />
        </Surface>
      )}
    </>
  );
}
