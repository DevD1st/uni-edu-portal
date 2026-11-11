import { useState } from "react";
import { Badge, Button, Checkbox, ResourceState, Surface, TextField } from "@uemp/ui";
import type { Dto } from "@uemp/api-contracts/response";
import { canDelegate, hasPrivilege, type Privilege } from "../../access/policy";
import {
  ActionNotice,
  CursorControls,
  StaffDialog,
  StaffResource,
  requiredText,
  textField,
} from "../../portal/components/staff-controls";
import { StaffRecords } from "../../portal/components/staff-records";
import {
  changeStaff,
  staffPath,
  useCursor,
  useStaffAccess,
  useStaffAction,
  useStaffResource,
  writeStaff,
} from "../../portal/staff-data";

const api = "/v1/admin/roles";
type Role = Dto<"RoleResponseDto">;
type Mode = { type: "create" } | { type: "edit" | "delete"; role: Role };

export function RolesWorkspace() {
  const { grants, revalidate } = useStaffAccess();
  const read = hasPrivilege(grants, "read_role", null);
  const manage = hasPrivilege(grants, "manage_roles", null);
  const cursor = useCursor();
  const resource = useStaffResource(
    read ? staffPath(api, { cursor: cursor.value }) : null,
    "RolePageResponseDto",
  );
  const action = useStaffAction();
  const [mode, setMode] = useState<Mode>();
  const owned = [
    ...new Set(
      grants
        .filter(({ departmentId }) => departmentId === null)
        .flatMap(({ privileges }) => privileges),
    ),
  ].sort();
  const canChange = (role: Role) =>
    manage && role.kind === "custom" && canDelegate(grants, role.privileges, null);
  const role = mode && "role" in mode ? mode.role : undefined;
  function open(value: Mode) {
    action.reset();
    setMode(value);
  }
  function saved() {
    setMode(undefined);
    resource.reload();
    revalidate();
  }

  return (
    <Surface className="u-stack">
      <div className="u-actions">
        {manage && (
          <Button onClick={() => open({ type: "create" })}>Create custom role</Button>
        )}
      </div>
      {!mode && <ActionNotice error={action.error} success={action.success} />}
      {read ? (
        <StaffResource resource={resource} title="role definitions">
          {({ items, nextCursor }) => (
            <>
              <StaffRecords
                empty="No roles on this page"
                items={items.map((item) => ({
                  id: item.id,
                  title: item.name,
                  details: [
                    {
                      label: "Type",
                      value: (
                        <Badge>{item.kind === "system" ? "System" : "Custom"}</Badge>
                      ),
                    },
                    { label: "Description", value: item.description ?? "—" },
                    {
                      label: "Privileges",
                      value: item.privileges.join(", ") || "None",
                    },
                  ],
                  actions: canChange(item) ? (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => open({ type: "edit", role: item })}
                      >
                        Edit role
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => open({ type: "delete", role: item })}
                      >
                        Delete role
                      </Button>
                    </>
                  ) : null,
                }))}
              />
              <CursorControls cursor={cursor} next={nextCursor} />
            </>
          )}
        </StaffResource>
      ) : (
        <ResourceState
          state="restricted"
          title="The role directory requires university-wide role reading access"
        />
      )}
      {mode && manage && (!role || canChange(role)) && (
        <StaffDialog
          title={
            mode.type === "delete"
              ? "Delete custom role"
              : role
                ? "Edit custom role"
                : "Create custom role"
          }
          label={mode.type === "delete" ? "Delete role" : "Save role"}
          close={() => setMode(undefined)}
          pending={action.pending}
          error={action.error}
          danger={mode.type === "delete"}
          submit={(form) => {
            if (mode.type === "delete") {
              void action.run(
                () => changeStaff(api + "/" + mode.role.id, "DELETE"),
                "Role deleted.",
                saved,
              );
              return;
            }
            void action.run(
              () => {
                const privileges = form
                  .getAll("privileges")
                  .filter(
                    (value): value is Privilege =>
                      typeof value === "string" && owned.some((item) => item === value),
                  );
                const input: Dto<"WriteRoleDto"> = {
                  name: requiredText(form, "name", "a role name"),
                  description: textField(form, "description") || null,
                  privileges,
                };
                return writeStaff(
                  api + (role ? "/" + role.id : ""),
                  role ? "PUT" : "POST",
                  "RoleResponseDto",
                  input,
                );
              },
              "Role saved.",
              saved,
            );
          }}
        >
          {mode.type === "delete" ? (
            <p>
              Delete the role {mode.role.name}? Roles with active assignments must be
              unassigned first.
            </p>
          ) : (
            <>
              <TextField
                name="name"
                label="Role name"
                defaultValue={role?.name}
                maxLength={80}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                hint="Use lowercase letters, digits, and hyphens."
                required
              />
              <TextField
                name="description"
                label="Description"
                defaultValue={role?.description ?? ""}
                maxLength={255}
              />
              <fieldset className="staff-fields min-w-0">
                <legend>Privileges</legend>
                {owned.map((privilege) => (
                  <Checkbox
                    key={privilege}
                    name="privileges"
                    value={privilege}
                    label={privilege.replaceAll("_", " ")}
                    defaultChecked={role?.privileges.includes(privilege)}
                  />
                ))}
              </fieldset>
            </>
          )}
        </StaffDialog>
      )}
    </Surface>
  );
}
