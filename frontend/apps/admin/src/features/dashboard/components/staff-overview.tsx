import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { PageHeader, ResourceState, Surface } from "@uemp/ui";
import { permitsSomewhere, reviewRule } from "../../access/policy";
import { useStaffAccess } from "../../portal/staff-data";
import { workspaceGroups, workspacePath } from "../../portal/workspaces";
import { AcademicSummary } from "./academic-summary";
import { ReviewSummary } from "./review-summary";
import { TeachingSummary } from "./teaching-summary";

export function StaffOverview() {
  const { grants } = useStaffAccess();
  const teaching = permitsSomewhere(grants, { anyOf: [["teach_course"]] });
  const review = permitsSomewhere(grants, reviewRule);
  const reporting = permitsSomewhere(grants, { anyOf: [["read_reports"]] });
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
      <div
        className="staff-grid staff-dashboard-grid"
        data-primary-cards={Number(teaching) + Number(review)}
      >
        {teaching && <TeachingSummary />}
        {review && <ReviewSummary />}
        {reporting && <AcademicSummary />}
      </div>
      {workspaces.length ? (
        <section className="u-stack staff-workspaces" aria-label="Available workspaces">
          <div className="staff-section-heading">
            <div>
              <h2>Your workspaces</h2>
              <p className="u-muted">The tools available with your current access.</p>
            </div>
          </div>
          <div className="staff-grid">
            {workspaces.map((workspace) => (
              <Link
                className="staff-card staff-workspace-card"
                key={workspace.slug}
                to={workspacePath(workspace)}
              >
                <Surface className="u-stack">
                  <div className="staff-workspace-card-heading">
                    <span className="staff-workspace-icon">
                      <workspace.icon size={22} aria-hidden />
                    </span>
                    <ArrowUpRight
                      className="staff-workspace-arrow"
                      size={20}
                      aria-hidden
                    />
                  </div>
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
