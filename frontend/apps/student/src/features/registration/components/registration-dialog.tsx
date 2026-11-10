"use client";

import { Button, Dialog } from "@uemp/ui";
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
    <Dialog open={open} onClose={close} title="Confirm course registration">
      <div className="u-stack">
        <ul className="student-course-list">
          {courses.map(({ offeringId, code, name, units }) => (
            <li key={offeringId}>
              {code} · {name} ({units} units)
            </li>
          ))}
        </ul>
        <p>
          <strong>
            {totalUnits} of {maxUnits} credit units
          </strong>{" "}
          after registration.
        </p>
        <div className="u-actions">
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
