import { useState } from "react";
import { Button } from "@uemp/ui";
import type { Dto } from "@uemp/api-contracts/response";
import {
  canProvisionLecturer,
  hasPrivilege,
  permitsSomewhere,
} from "../../access/policy";
import {
  ActionNotice,
  StaffDialog,
  StaffResource,
  textField,
} from "../../portal/components/staff-controls";
import {
  useStaffAccess,
  useStaffAction,
  useStaffResource,
  writeStaff,
} from "../../portal/staff-data";
import { AccountFields, newAccount } from "./account-fields";
import { GrantFields } from "./grant-fields";
import { PlacementFields, readPlacement } from "./placement-fields";

export function CreatePerson({ updated }: { updated: () => void }) {
  const { grants } = useStaffAccess();
  const canStudent = permitsSomewhere(grants, { anyOf: [["create_student"]] });
  const canStaff =
    hasPrivilege(grants, "create_admin", null) ||
    grants.some(
      ({ departmentId }) =>
        departmentId !== null &&
        hasPrivilege(grants, "create_admin", departmentId) &&
        (canProvisionLecturer(grants, departmentId) ||
          hasPrivilege(grants, "manage_admin_roles", departmentId)),
    );
  const [mode, setMode] = useState<"student" | "staff">();
  const action = useStaffAction();
  const references = useStaffResource(
    mode ? "/v1/academic-references" : null,
    "AcademicReferencesResponseDto",
  );
  if (!canStudent && !canStaff) return null;

  function open(value: "student" | "staff") {
    action.reset();
    setMode(value);
  }

  return (
    <div className="u-stack">
      <div className="u-actions">
        {canStudent && (
          <Button onClick={() => open("student")}>Create student account</Button>
        )}
        {canStaff && (
          <Button onClick={() => open("staff")}>Create staff account</Button>
        )}
      </div>
      {!mode && <ActionNotice error={action.error} success={action.success} />}
      {mode && (mode === "student" ? canStudent : canStaff) && (
        <StaffDialog
          title={mode === "student" ? "Create student account" : "Create staff account"}
          label="Create account"
          close={() => setMode(undefined)}
          pending={action.pending}
          error={action.error}
          submit={(form) =>
            void action.run<unknown>(
              () => {
                if (!references.data)
                  throw new Error("Account placement choices are still loading.");
                const account = newAccount(form);
                if (mode === "student") {
                  const placement = readPlacement(form);
                  return writeStaff(
                    "/v1/admin/users/students",
                    "POST",
                    "UserResponseDto",
                    {
                      ...account,
                      ...placement,
                    } satisfies Dto<"CreateStudentDto">,
                  );
                }
                const departmentId = textField(form, "departmentId") || null;
                const roleId = textField(form, "roleId");
                if (
                  departmentId &&
                  !roleId &&
                  !canProvisionLecturer(grants, departmentId)
                )
                  throw new Error("Choose an initial role for this department.");
                return writeStaff(
                  "/v1/admin/admins",
                  "POST",
                  "CreatedAdminResponseDto",
                  {
                    ...account,
                    departmentId,
                    ...(roleId ? { roleId } : {}),
                  } satisfies Dto<"CreateAdminDto">,
                );
              },
              mode === "student"
                ? "Student account created."
                : "Staff account created.",
              () => {
                setMode(undefined);
                updated();
              },
            )
          }
        >
          <AccountFields password />
          <StaffResource resource={references} title="placement choices">
            {(data) =>
              mode === "student" ? (
                <PlacementFields
                  references={data}
                  allowed={(department) =>
                    hasPrivilege(grants, "create_student", department)
                  }
                  allowUnassigned={hasPrivilege(grants, "create_student", null)}
                />
              ) : (
                <GrantFields references={data} create />
              )
            }
          </StaffResource>
        </StaffDialog>
      )}
    </div>
  );
}
