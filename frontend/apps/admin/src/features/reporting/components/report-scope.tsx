import { useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { ResourceState } from "@uemp/ui";
import { hasPrivilege } from "../../access/policy";
import { ChoiceField, StaffResource } from "../../portal/components/staff-controls";
import { useStaffAccess, useStaffResource } from "../../portal/staff-data";

export type ReportFilters = { semesterId: string; departmentId: string | null };

export function ReportScope({
  children,
  prefix = "",
}: {
  children: (filters: ReportFilters) => ReactNode;
  prefix?: string;
}) {
  const { grants } = useStaffAccess();
  const [query] = useSearchParams();
  const resource = useStaffResource(
    "/v1/admin/reports/options",
    "AcademicReportOptionsDto",
  );
  const [selected, select] = useState<{ semesterId?: string; departmentId?: string }>(
    () => ({
      semesterId: query.get("semesterId") ?? "",
      departmentId: query.get("departmentId") ?? "",
    }),
  );
  const university = hasPrivilege(grants, "read_reports", null);
  const fieldLabel = (name: string) => (prefix ? prefix + name.toLowerCase() : name);
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
            <div
              className="staff-fields"
              role="group"
              aria-label={(prefix.trim() || "Report") + " filters"}
            >
              <ChoiceField
                label={fieldLabel("Semester")}
                value={semesterId}
                options={options(semesters)}
                emptyLabel={null}
                onChange={(event) =>
                  select({ ...selected, semesterId: event.target.value })
                }
              />
              <ChoiceField
                label={fieldLabel("Department")}
                value={departmentId ?? ""}
                options={options(eligible)}
                emptyLabel={university ? "Entire university" : null}
                onChange={(event) =>
                  select({ ...selected, departmentId: event.target.value })
                }
              />
            </div>
            {children({ semesterId, departmentId })}
          </>
        );
      }}
    </StaffResource>
  );
}
