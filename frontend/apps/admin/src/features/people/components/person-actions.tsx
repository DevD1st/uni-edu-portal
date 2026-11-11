import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@uemp/ui";
import type { Dto } from "@uemp/api-contracts/response";
import { hasPrivilege } from "../../access/policy";
import {
  ActionNotice,
  StaffDialog,
  StaffResource,
  requiredText,
} from "../../portal/components/staff-controls";
import {
  changeStaff,
  useStaffAccess,
  useStaffAction,
  useStaffResource,
  writeStaff,
} from "../../portal/staff-data";
import { AccountFields, names } from "./account-fields";
import { PlacementFields, readPlacement } from "./placement-fields";
import { peopleRoot } from "./people-directory";

type Person = Dto<"AdminDirectoryUserResponseDto">;
type Student = NonNullable<Dto<"UserResponseDto">["student"]>;
type Mode = "profile" | "placement" | "status" | "sessions" | "delete";

export function PersonActions({
  person,
  student,
  editStaff,
  updated,
}: {
  person: Person;
  student?: Student | null;
  editStaff?: boolean;
  updated: (deleted?: boolean) => void;
}) {
  const { grants, userId, revalidate } = useStaffAccess();
  const isStudent = student !== undefined;
  const department = student?.departmentId ?? null;
  const allowProfile = isStudent
    ? hasPrivilege(grants, "update_user", department)
    : Boolean(editStaff);
  const allowEmail = hasPrivilege(grants, "update_user", department);
  const allowPlacement =
    isStudent && hasPrivilege(grants, "update_student_placement", department);
  const allowStatus = hasPrivilege(grants, "suspend_user", department);
  const allowSessions = hasPrivilege(grants, "revoke_user_sessions", department);
  const allowDelete = hasPrivilege(grants, "delete_user", department);
  const allowRegistration =
    isStudent &&
    person.status === "active" &&
    hasPrivilege(grants, "register_student_courses", department);
  const status = person.status === "active" ? "suspended" : "active";
  const statusLabel = status === "active" ? "Activate account" : "Suspend account";
  const [mode, setMode] = useState<Mode>();
  const action = useStaffAction();
  const references = useStaffResource(
    mode === "placement" && allowPlacement ? "/v1/academic-references" : null,
    "AcademicReferencesResponseDto",
  );
  const path = "/v1/admin/users/" + person.id;
  const decisions = {
    profile: { label: "Save profile", title: "Edit profile", enabled: allowProfile },
    placement: {
      label: "Save placement",
      title: "Update student placement",
      enabled: allowPlacement,
    },
    status: { label: statusLabel, title: statusLabel, enabled: allowStatus },
    sessions: {
      label: "Revoke sessions",
      title: "Revoke account sessions",
      enabled: allowSessions,
    },
    delete: {
      label: "Delete account",
      title: "Delete account and redact personal data",
      enabled: allowDelete,
    },
  };

  function open(selected: Mode) {
    action.reset();
    setMode(selected);
  }
  function finish(deleted = false) {
    setMode(undefined);
    if (userId === person.id) revalidate();
    updated(deleted);
  }

  function submit(form: FormData) {
    if (!mode || !decisions[mode].enabled) return;
    if (mode === "delete" || mode === "sessions") {
      void action.run(
        () =>
          changeStaff(
            path + (mode === "sessions" ? "/revoke-sessions" : ""),
            mode === "sessions" ? "POST" : "DELETE",
          ),
        mode === "sessions" ? "Sessions revoked." : "Account deleted.",
        () => finish(mode === "delete"),
      );
      return;
    }
    void action.run(
      () => {
        if (mode === "profile")
          return writeStaff(path, "PATCH", "UserResponseDto", {
            ...names(form),
            ...(allowEmail
              ? { email: requiredText(form, "email", "an email address") }
              : {}),
          } satisfies Dto<"UpdateUserDto">);
        if (mode === "status")
          return writeStaff(path + "/status", "PATCH", "UserResponseDto", {
            status,
          } satisfies Dto<"UpdateUserStatusDto">);
        if (!references.data) throw new Error("Placement choices are unavailable.");
        return writeStaff(
          path + "/student-placement",
          "PUT",
          "UserResponseDto",
          readPlacement(form),
        );
      },
      "Account updated.",
      () => finish(),
    );
  }

  return (
    <div className="u-stack">
      {!mode && <ActionNotice error={action.error} success={action.success} />}
      <div className="u-actions">
        {allowProfile && (
          <Button variant="secondary" onClick={() => open("profile")}>
            Edit profile
          </Button>
        )}
        {allowPlacement && (
          <Button variant="secondary" onClick={() => open("placement")}>
            Update placement
          </Button>
        )}
        {allowRegistration && (
          <Link
            className="u-text-link"
            to={"/workspaces/registration/students/" + person.id}
          >
            Register courses
          </Link>
        )}
        {allowStatus && (
          <Button variant="secondary" onClick={() => open("status")}>
            {statusLabel}
          </Button>
        )}
        {allowSessions && (
          <Button variant="secondary" onClick={() => open("sessions")}>
            Revoke sessions
          </Button>
        )}
        {allowDelete && (
          <Button variant="secondary" onClick={() => open("delete")}>
            Delete account
          </Button>
        )}
      </div>
      {mode && decisions[mode].enabled && (
        <StaffDialog
          title={decisions[mode].title}
          label={decisions[mode].label}
          close={() => setMode(undefined)}
          submit={submit}
          pending={action.pending}
          error={action.error}
          danger={mode === "delete"}
        >
          {mode === "profile" && <AccountFields record={person} email={allowEmail} />}
          {mode === "placement" && (
            <StaffResource resource={references} title="academic placements">
              {(data) => (
                <PlacementFields
                  references={data}
                  allowed={(id) => hasPrivilege(grants, "update_student_placement", id)}
                  initial={student ?? {}}
                  allowUnassigned={hasPrivilege(
                    grants,
                    "update_student_placement",
                    null,
                  )}
                />
              )}
            </StaffResource>
          )}
          {mode === "status" && (
            <p>
              {status === "active"
                ? "Allow this account to sign in again?"
                : "Suspend this account and end its active sessions?"}
            </p>
          )}
          {mode === "sessions" && (
            <p>This person will need to sign in again on every device.</p>
          )}
          {mode === "delete" && (
            <p>
              This permanently redacts the person's direct identifiers and ends their
              sessions. Academic and audit history is retained.
            </p>
          )}
        </StaffDialog>
      )}
    </div>
  );
}

export function BackToPeople() {
  return (
    <Link className="u-text-link" to={peopleRoot}>
      Back to accounts
    </Link>
  );
}
