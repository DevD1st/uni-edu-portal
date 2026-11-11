import { useState } from "react";
import type { Dto } from "@uemp/api-contracts/response";
import { canDelegate, canProvisionLecturer, hasPrivilege } from "../../access/policy";
import {
  ChoiceField,
  CursorControls,
  StaffResource,
  namedOptions,
} from "../../portal/components/staff-controls";
import {
  staffPath,
  useCursor,
  useStaffAccess,
  useStaffResource,
} from "../../portal/staff-data";

type References = Dto<"AcademicReferencesResponseDto">;
type Role = Pick<Dto<"RoleResponseDto">, "id" | "name" | "systemKey" | "privileges">;

export function mayGrantRole(
  role: Role,
  grants: ReturnType<typeof useStaffAccess>["grants"],
  departmentId: string | null,
) {
  return (
    hasPrivilege(grants, "manage_admin_roles", departmentId) &&
    canDelegate(grants, role.privileges, departmentId) &&
    (role.systemKey !== "super_admin" ||
      (departmentId === null &&
        grants.some(
          (grant) => grant.systemKey === "super_admin" && grant.departmentId === null,
        )))
  );
}

function RoleChoice({
  departmentId,
  required,
  provision = false,
}: {
  departmentId: string | null;
  required: boolean;
  provision?: boolean;
}) {
  const { grants } = useStaffAccess();
  const read = hasPrivilege(grants, "read_role", null);
  const cursor = useCursor();
  const roles = useStaffResource(
    read ? staffPath("/v1/admin/roles", { cursor: cursor.value }) : null,
    "RolePageResponseDto",
  );
  function choices(items: Role[]) {
    return (
      <ChoiceField
        name="roleId"
        label="Role"
        required={required}
        emptyLabel={
          required
            ? "Select a role"
            : provision
              ? "Lecturer role (default)"
              : "No initial role"
        }
        options={namedOptions(
          items.filter((role) => mayGrantRole(role, grants, departmentId)),
        )}
      />
    );
  }
  if (!read) {
    // Scoped staff can delegate only roles they can identify and whose privileges they hold.
    const known = [
      ...new Map(
        grants.map((grant) => [grant.roleId, { ...grant, id: grant.roleId }]),
      ).values(),
    ];
    return choices(known);
  }
  return (
    <StaffResource resource={roles} title="role choices">
      {({ items, nextCursor }) => (
        <>
          {choices(items)}
          <CursorControls cursor={cursor} next={nextCursor} />
        </>
      )}
    </StaffResource>
  );
}

export function GrantFields({
  references,
  create = false,
}: {
  references: References;
  create?: boolean;
}) {
  const { grants } = useStaffAccess();
  const privilege = create ? "create_admin" : "manage_admin_roles";
  const university = hasPrivilege(grants, privilege, null);
  const departments = references.departments.filter(
    ({ id }) =>
      hasPrivilege(grants, privilege, id) &&
      (!create ||
        canProvisionLecturer(grants, id) ||
        hasPrivilege(grants, "manage_admin_roles", id)),
  );
  const [selected, select] = useState(university ? "" : (departments[0]?.id ?? ""));
  const departmentId = selected || null;
  const provision =
    create && departmentId !== null && canProvisionLecturer(grants, departmentId);
  const canAssign = hasPrivilege(grants, "manage_admin_roles", departmentId);

  return (
    <fieldset className="staff-fields staff-form-group">
      <legend>Role and access</legend>
      <ChoiceField
        name="departmentId"
        label="Scope"
        value={selected}
        required={!university}
        options={namedOptions(departments)}
        emptyLabel={university ? "University-wide" : "Select a department"}
        onChange={(event) => select(event.target.value)}
      />
      {provision && !canAssign ? (
        <p>The new account will receive the Lecturer role in this department.</p>
      ) : canAssign ? (
        <RoleChoice
          key={selected}
          departmentId={departmentId}
          required={!create || (Boolean(departmentId) && !provision)}
          provision={provision}
        />
      ) : (
        <p className="u-muted">The account can be created without an initial role.</p>
      )}
    </fieldset>
  );
}
