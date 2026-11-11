import { useState } from "react";
import { Badge, DataTable, DescriptionList, ResourceState, Surface } from "@uemp/ui";
import { hasPrivilege } from "../../access/policy";
import {
  ChoiceField,
  CursorControls,
  StaffResource,
} from "../../portal/components/staff-controls";
import {
  staffPath,
  useCursor,
  useStaffAccess,
  useStaffResource,
} from "../../portal/staff-data";
import { markText, ResultStatus } from "../../teaching/components/result-status";

const api = "/v1/admin/reports";
type Filters = { semesterId: string; departmentId: string | null };

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
            <DescriptionList
              items={[
                { label: "Offerings", value: overview.offeringCount },
                { label: "Active offerings", value: overview.activeOfferingCount },
                { label: "Closed rosters", value: overview.closedRosterCount },
                { label: "Students registered", value: overview.studentCount },
                { label: "Enrollments", value: overview.enrollmentCount },
                { label: "Draft groups", value: overview.pendingCount },
                { label: "Awaiting review", value: overview.submittedCount },
                {
                  label: "Corrections requested",
                  value: overview.correctionRequestedCount,
                },
                { label: "Approved groups", value: overview.approvedCount },
                { label: "Published grades", value: overview.publishedCount },
                { label: "Passing grades", value: overview.passedCount },
                { label: "Published average", value: markText(overview.averageScore) },
              ]}
            />
          )}
        </StaffResource>
      </Surface>
      <Surface className="u-stack">
        <h2>Course performance</h2>
        <CoursePerformance filters={filters} />
      </Surface>
    </>
  );
}

export function ReportWorkspace() {
  const { grants } = useStaffAccess();
  const resource = useStaffResource(api + "/options", "AcademicReportOptionsDto");
  const [selected, select] = useState<{ semesterId?: string; departmentId?: string }>(
    {},
  );
  const university = hasPrivilege(grants, "read_reports", null);
  return (
    <StaffResource resource={resource} title="report filters">
      {({ semesters, departments }) => {
        const eligible = departments.filter(({ id }) =>
          hasPrivilege(grants, "read_reports", id),
        );
        const semesterId =
          semesters.find(({ id }) => id === selected.semesterId)?.id ??
          semesters[0]?.id;
        const departmentId =
          eligible.find(({ id }) => id === selected.departmentId)?.id ??
          (university ? null : eligible[0]?.id);
        if (!semesterId || departmentId === undefined)
          return <ResourceState state="empty" title="No report scope is available" />;
        const options = (items: typeof semesters) =>
          items.map(({ id, label }) => ({ value: id, label }));
        return (
          <>
            <Surface className="staff-fields" aria-label="Report filters">
              <ChoiceField
                label="Semester"
                value={semesterId}
                options={options(semesters)}
                emptyLabel={null}
                onChange={(event) =>
                  select({ ...selected, semesterId: event.target.value })
                }
              />
              <ChoiceField
                label="Department"
                value={departmentId ?? ""}
                options={options(eligible)}
                emptyLabel={university ? "Entire university" : null}
                onChange={(event) =>
                  select({ ...selected, departmentId: event.target.value })
                }
              />
            </Surface>
            <Report
              key={semesterId + ":" + departmentId}
              filters={{ semesterId, departmentId }}
            />
          </>
        );
      }}
    </StaffResource>
  );
}
