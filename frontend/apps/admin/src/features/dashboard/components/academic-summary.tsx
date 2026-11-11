import { DescriptionList, Surface } from "@uemp/ui";
import { Link } from "react-router";
import { StaffResource } from "../../portal/components/staff-controls";
import { staffPath, useStaffResource } from "../../portal/staff-data";
import {
  ReportScope,
  type ReportFilters,
} from "../../reporting/components/report-scope";

function Totals({ filters }: { filters: ReportFilters }) {
  const resource = useStaffResource(
    staffPath("/v1/admin/reports/overview", filters),
    "AcademicOverviewDto",
  );
  return (
    <StaffResource resource={resource} title="academic summary">
      {(data) => (
        <DescriptionList
          items={[
            { label: "Students registered", value: data.studentCount },
            { label: "Course offerings", value: data.offeringCount },
            { label: "Awaiting review", value: data.submittedCount },
            { label: "Corrections requested", value: data.correctionRequestedCount },
            { label: "Published grades", value: data.publishedCount },
            { label: "Closed rosters", value: data.closedRosterCount },
          ]}
        />
      )}
    </StaffResource>
  );
}

export function AcademicSummary() {
  return (
    <Surface className="u-stack" aria-label="Academic dashboard">
      <h2>Academic summary</h2>
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
