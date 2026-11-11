import { useState } from "react";
import { Button, ResourceState, Surface } from "@uemp/ui";
import type { Dto } from "@uemp/api-contracts/response";
import { permitsSomewhere } from "../../access/policy";
import {
  ActionNotice,
  StaffDialog,
  StaffResource,
  requiredText,
  textField,
} from "../../portal/components/staff-controls";
import { StaffRecords } from "../../portal/components/staff-records";
import {
  changeStaff,
  useStaffAccess,
  useStaffAction,
  useStaffResource,
  writeStaff,
} from "../../portal/staff-data";
import { GrantFields, mayGrantRole } from "./grant-fields";

type Admin = Dto<"AdminResponseDto">;
type Grant = NonNullable<Admin["roles"]>[number];
type Mode = { type: "assign" } | { type: "revoke"; grant: Grant };

export function StaffRoleAssignments({
  admin,
  updated,
}: {
  admin: Admin;
  updated: () => void;
}) {
  const { grants, adminId, revalidate } = useStaffAccess();
  const manage = permitsSomewhere(grants, { anyOf: [["manage_admin_roles"]] });
  const [mode, setMode] = useState<Mode>();
  const references = useStaffResource(
    "/v1/academic-references",
    "AcademicReferencesResponseDto",
  );
  const action = useStaffAction();
  const path = "/v1/admin/admins/" + admin.id + "/roles";
  function open(value: Mode) {
    action.reset();
    setMode(value);
  }
  function complete() {
    setMode(undefined);
    updated();
    if (adminId === admin.id) revalidate();
  }

  return (
    <Surface className="u-stack" aria-label="Role assignments">
      <div className="staff-section-heading">
        <h2>Role assignments</h2>
        {manage && (
          <Button onClick={() => open({ type: "assign" })}>Assign role</Button>
        )}
      </div>
      {!mode && <ActionNotice error={action.error} success={action.success} />}
      {admin.roles?.length ? (
        <StaffRecords
          empty="No visible role assignments"
          items={admin.roles.map((item) => ({
            id: item.id,
            title: item.role.name,
            details: [
              {
                label: "Scope",
                value:
                  item.departmentId === null
                    ? "University-wide"
                    : (references.data?.departments.find(
                        ({ id }) => id === item.departmentId,
                      )?.name ?? "Department " + item.departmentId.slice(0, 8)),
              },
            ],
            actions: mayGrantRole(item.role, grants, item.departmentId) && (
              <Button
                variant="secondary"
                onClick={() => open({ type: "revoke", grant: item })}
              >
                Revoke assignment
              </Button>
            ),
          }))}
        />
      ) : (
        <ResourceState state="empty" title="No visible role assignments" />
      )}
      {mode &&
        manage &&
        (mode.type === "assign" ||
          mayGrantRole(mode.grant.role, grants, mode.grant.departmentId)) && (
          <StaffDialog
            title={mode.type === "assign" ? "Assign staff role" : "Revoke staff role"}
            label={mode.type === "assign" ? "Assign role" : "Revoke assignment"}
            danger={mode.type === "revoke"}
            close={() => setMode(undefined)}
            pending={action.pending}
            error={action.error}
            submit={(form) => {
              if (mode.type === "revoke") {
                void action.run(
                  () => changeStaff(path + "/" + mode.grant.id, "DELETE"),
                  "Assignment revoked.",
                  complete,
                );
                return;
              }
              void action.run(
                () =>
                  writeStaff(path, "POST", "RoleAssignmentResponseDto", {
                    roleId: requiredText(form, "roleId", "a role"),
                    departmentId: textField(form, "departmentId") || null,
                  } satisfies Dto<"AssignAdminRoleDto">),
                "Role assigned.",
                complete,
              );
            }}
          >
            {mode.type === "assign" ? (
              <StaffResource resource={references} title="role scopes">
                {(data) => <GrantFields references={data} />}
              </StaffResource>
            ) : (
              <p>
                Revoke the {mode.grant.role.name} assignment from this staff account?
              </p>
            )}
          </StaffDialog>
        )}
    </Surface>
  );
}
