import { Surface } from "@uemp/ui";
import { StaffMetrics } from "../../portal/components/staff-metrics";
import { Link } from "react-router";
import { StaffResource } from "../../portal/components/staff-controls";
import { staffPath, useStaffResource } from "../../portal/staff-data";
import {
  ReportScope,
  type ReportFilters,
} from "../../reporting/components/report-scope";
import { ResultWorkflowChart } from "./result-workflow-chart";

function Totals({ filters }: { filters: ReportFilters }) {
  const resource = useStaffResource(
    staffPath("/v1/admin/reports/overview", filters),
    "AcademicOverviewDto",
  );
  return (
    <StaffResource resource={resource} title="academic summary">
      {(data) => (
        <>
          <StaffMetrics
            items={[
              { label: "Students registered", value: data.studentCount },
              { label: "Course offerings", value: data.offeringCount },
              { label: "Published grades", value: data.publishedCount },
              { label: "Closed rosters", value: data.closedRosterCount },
            ]}
          />
          <ResultWorkflowChart summary={data} />
        </>
      )}
    </StaffResource>
  );
}

export function AcademicSummary() {
  return (
    <Surface
      className="u-stack staff-summary-card staff-summary-card--wide"
      aria-label="Academic dashboard"
    >
      <h2>Academic summary</h2>
      <p className="u-muted">
        Registration and published results for the scope you choose.
      </p>
      <ReportScope prefix="Report ">
        {(filters) => (
          <>
            <Totals
              key={filters.semesterId + ":" + filters.departmentId}
              filters={filters}
            />
            <Link
              className="u-text-link"
              to={staffPath("/workspaces/reports", filters)}
            >
              Open academic reports
            </Link>
          </>
        )}
      </ReportScope>
    </Surface>
  );
}
