import { useState } from "react";
import { Link } from "react-router";
import { Button, DataTable, ResourceState, Surface } from "@uemp/ui";
import { permitsSomewhere } from "../../access/policy";
import { CursorControls, StaffResource } from "../../portal/components/staff-controls";
import {
  staffPath,
  useCursor,
  useStaffAccess,
  useStaffResource,
} from "../../portal/staff-data";
import { CreatePerson } from "./create-person";
import { AccountStatus } from "./account-status";

export const peopleRoot = "/workspaces/accounts";

export function accountName(profile: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  return (
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email
  );
}

function StudentDirectory() {
  const cursor = useCursor();
  const resource = useStaffResource(
    staffPath("/v1/admin/users", { populate: "student", cursor: cursor.value }),
    "UserPageResponseDto",
  );
  return (
    <StaffResource resource={resource} title="student accounts">
      {({ items, nextCursor }) => {
        const students = items.filter((item) => item.role === "student");
        return (
          <>
            {students.length ? (
              <DataTable
                caption="Student accounts"
                columns={[
                  { label: "Student" },
                  { label: "Email" },
                  { label: "Matriculation number" },
                  { label: "Status" },
                ]}
              >
                {students.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">
                      <Link
                        className="u-text-link"
                        to={peopleRoot + "/students/" + item.id}
                      >
                        {accountName(item)}
                      </Link>
                    </th>
                    <td>{item.email}</td>
                    <td>{item.student?.matricNumber ?? "—"}</td>
                    <td>
                      <AccountStatus status={item.status} />
                    </td>
                  </tr>
                ))}
              </DataTable>
            ) : (
              <ResourceState state="empty" title="No students on this page" />
            )}
            <CursorControls cursor={cursor} next={nextCursor} />
          </>
        );
      }}
    </StaffResource>
  );
}

function StaffDirectory() {
  const cursor = useCursor();
  const resource = useStaffResource(
    staffPath("/v1/admin/admins", { populate: "user roles", cursor: cursor.value }),
    "AdminPageResponseDto",
  );
  return (
    <StaffResource resource={resource} title="staff accounts">
      {({ items, nextCursor }) => (
        <>
          {items.length ? (
            <DataTable
              caption="Staff accounts"
              columns={[
                { label: "Staff member" },
                { label: "Email" },
                { label: "Status" },
              ]}
            >
              {items.map((item) => (
                <tr key={item.id}>
                  <th scope="row">
                    <Link className="u-text-link" to={peopleRoot + "/staff/" + item.id}>
                      {item.user
                        ? accountName(item.user)
                        : "Staff " + item.id.slice(0, 8)}
                    </Link>
                  </th>
                  <td>{item.user?.email ?? "—"}</td>
                  <td>
                    <AccountStatus status={item.user?.status ?? ""} />
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <ResourceState state="empty" title="No staff accounts on this page" />
          )}
          <CursorControls cursor={cursor} next={nextCursor} />
        </>
      )}
    </StaffResource>
  );
}

export function PeopleDirectory() {
  const { grants } = useStaffAccess();
  const students = permitsSomewhere(grants, { anyOf: [["read_user"]] });
  const staff = permitsSomewhere(grants, { anyOf: [["read_admin"]] });
  const [tab, setTab] = useState<"students" | "staff">(students ? "students" : "staff");
  const [revision, revise] = useState(0);
  const current = (tab === "students" && students) || !staff ? "students" : "staff";
  return (
    <Surface className="u-stack">
      <CreatePerson updated={() => revise((value) => value + 1)} />
      <div className="staff-filter-tabs" role="group" aria-label="Account directories">
        {students && (
          <Button
            variant={current === "students" ? "primary" : "secondary"}
            aria-pressed={current === "students"}
            onClick={() => setTab("students")}
          >
            Students
          </Button>
        )}
        {staff && (
          <Button
            variant={current === "staff" ? "primary" : "secondary"}
            aria-pressed={current === "staff"}
            onClick={() => setTab("staff")}
          >
            Staff
          </Button>
        )}
      </div>
      {current === "students" && students && <StudentDirectory key={revision} />}
      {current === "staff" && staff && <StaffDirectory key={revision} />}
    </Surface>
  );
}
