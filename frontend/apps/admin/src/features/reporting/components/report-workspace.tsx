import { Badge, DataTable, ResourceState, Surface } from "@uemp/ui";
import { StaffMetrics } from "../../portal/components/staff-metrics";
import { CursorControls, StaffResource } from "../../portal/components/staff-controls";
import { staffPath, useCursor, useStaffResource } from "../../portal/staff-data";
import { markText, ResultStatus } from "../../teaching/components/result-status";
import { ReportScope, type ReportFilters } from "./report-scope";

const api = "/v1/admin/reports";
type Filters = ReportFilters;

function CoursePerformance({ filters }: { filters: Filters }) {
  const cursor = useCursor();
  const resource = useStaffResource(
    staffPath(api + "/courses", { ...filters, cursor: cursor.value }),
    "CoursePerformancePageDto",
  );
  return (
    <StaffResource resource={resource} title="course performance">
      {({ items, nextCursor }) => (
        <>
          {items.length ? (
            <DataTable
              caption="Course performance"
              columns={[
                { label: "Course" },
                { label: "Department" },
                { label: "Level" },
                { label: "Status" },
                { label: "Enrollments", numeric: true },
                { label: "Published", numeric: true },
                { label: "Passed", numeric: true },
                { label: "Average", numeric: true },
              ]}
            >
              {items.map((item) => (
                <tr key={item.offeringId}>
                  <th scope="row">
                    {item.code} · {item.name}
                  </th>
                  <td>{item.department}</td>
                  <td>{item.academicLevel}</td>
                  <td>
                    <div className="u-stack">
                      {item.resultStatus && <ResultStatus status={item.resultStatus} />}
                      {item.offeringStatus === "inactive" && (
                        <Badge>Inactive offering</Badge>
                      )}
                      <span>
                        {item.registrationStatus
                          ? "Roster " +
                            (item.registrationStatus === "opened" ? "open" : "closed")
                          : "No roster"}
                      </span>
                    </div>
                  </td>
                  <td data-numeric>{item.enrollmentCount}</td>
                  <td data-numeric>{item.publishedCount}</td>
                  <td data-numeric>{item.passedCount}</td>
                  <td data-numeric>{markText(item.averageScore)}</td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <ResourceState state="empty" title="No offerings in the selected scope" />
          )}
          <CursorControls cursor={cursor} next={nextCursor} />
        </>
      )}
    </StaffResource>
  );
}

function Report({ filters }: { filters: Filters }) {
  const resource = useStaffResource(
    staffPath(api + "/overview", filters),
    "AcademicOverviewDto",
  );
  return (
    <>
      <Surface className="u-stack" aria-label="Academic overview">
        <h2>Academic overview</h2>
        <StaffResource resource={resource} title="the academic overview">
          {(overview) => (
            <div className="u-stack">
              <section
                className="staff-metric-group"
                aria-label="Registration activity"
              >
                <h3>Registration activity</h3>
                <StaffMetrics
                  items={[
                    { label: "Offerings", value: overview.offeringCount },
                    { label: "Active offerings", value: overview.activeOfferingCount },
                    { label: "Closed rosters", value: overview.closedRosterCount },
                    { label: "Students registered", value: overview.studentCount },
                    { label: "Enrollments", value: overview.enrollmentCount },
                  ]}
                />
              </section>
              <section className="staff-metric-group" aria-label="Result workflow">
                <h3>Result workflow</h3>
                <StaffMetrics
                  items={[
                    { label: "Draft groups", value: overview.pendingCount },
                    { label: "Awaiting review", value: overview.submittedCount },
                    {
                      label: "Corrections requested",
                      value: overview.correctionRequestedCount,
                    },
                    { label: "Approved groups", value: overview.approvedCount },
                  ]}
                />
              </section>
              <section
                className="staff-metric-group"
                aria-label="Published performance"
              >
                <h3>Published performance</h3>
                <StaffMetrics
                  items={[
                    { label: "Published grades", value: overview.publishedCount },
                    { label: "Passing grades", value: overview.passedCount },
                    {
                      label: "Published average",
                      value: markText(overview.averageScore),
                    },
                  ]}
                />
              </section>
            </div>
          )}
        </StaffResource>
      </Surface>
      <Surface className="u-stack">
        <h2>Course performance</h2>
        <p className="u-muted">
          Only published results contribute to passing grades and average scores.
        </p>
        <CoursePerformance filters={filters} />
      </Surface>
    </>
  );
}

export function ReportWorkspace() {
  return (
    <ReportScope>
      {(filters) => (
        <Report
          key={filters.semesterId + ":" + filters.departmentId}
          filters={filters}
        />
      )}
    </ReportScope>
  );
}
