"use client";

import { Badge, Button, Dialog } from "@uemp/ui";
import type { AvailableCourses } from "../contracts";

export function RegistrationDialog({
  open,
  close,
  courses,
  totalUnits,
  maxUnits,
  pending,
  confirm,
  canSubmit,
}: {
  open: boolean;
  close: () => void;
  courses: AvailableCourses["courses"];
  totalUnits: number;
  maxUnits: number;
  pending: boolean;
  confirm: () => void;
  canSubmit: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={close}
      title="Confirm course registration"
      lockClose={pending}
    >
      <div className="u-stack">
        <p className="u-muted">
          Check your courses and credit units before confirming.
        </p>
        <ul className="student-course-list">
          {courses.map(({ offeringId, code, name, units }) => (
            <li key={offeringId}>
              <span>
                <strong>{code}</strong> · {name}
              </span>
              <Badge>{units} units</Badge>
            </li>
          ))}
        </ul>
        <p className="student-confirm-total">
          <strong>
            {totalUnits} of {maxUnits} credit units
          </strong>{" "}
          after registration.
        </p>
        <div className="student-dialog-actions u-actions">
          <Button variant="secondary" disabled={pending} onClick={close}>
            Edit selection
          </Button>
          <Button disabled={!canSubmit} pending={pending} onClick={confirm}>
            {pending ? "Registering courses" : "Register courses"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
