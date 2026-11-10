"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@uemp/web-client";
import { Banner, Button, Checkbox, ResourceState, Surface } from "@uemp/ui";
import { AcademicMetrics } from "../../portal/components/academic-metrics";
import { portalApi, studentError } from "../../portal/student-request";
import {
  readRegistrationSummary,
  type AvailableCourses,
  type RegistrationInput,
} from "../contracts";
import { RegistrationDialog } from "./registration-dialog";

export function CourseSelection({ available }: { available: AvailableCourses }) {
  const router = useRouter();
  const [chosen, setChosen] = useState<string[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [pending, setPending] = useState(false);
  const [refreshing, refresh] = useTransition();
  const [error, setError] = useState<string>();
  // Eligibility can change while the student is choosing courses.
  const selectedIds = new Set(chosen);
  const selection = available.courses.filter(({ offeringId }) =>
    selectedIds.has(offeringId),
  );
  const selectedCourseIds = new Set(selection.map(({ courseId }) => courseId));
  const selectedUnits = selection.reduce((total, course) => total + course.units, 0);
  const remaining = Math.max(0, available.maxUnits - available.registeredUnits);
  const excess = selectedUnits - remaining;
  const busy = pending || refreshing;
  const canSubmit =
    !busy && selection.length > 0 && selection.length <= 100 && excess <= 0;

  async function register() {
    if (!canSubmit) return;
    setPending(true);
    setError(undefined);
    const input: RegistrationInput = {
      semesterId: available.semesterId,
      offeringIds: selection.map(({ offeringId }) => offeringId),
    };
    try {
      const summary = await portalApi.request(
        "/api/student/registrations",
        readRegistrationSummary,
        {
          method: "POST",
          json: input,
        },
      );
      window.location.replace("/registration/" + summary.semesterId + "?registered=1");
    } catch (cause) {
      setError(studentError(cause));
      setReviewing(false);
      setPending(false);
      if (
        cause instanceof ApiError &&
        [0, 400, 408, 409, 502, 503].includes(cause.status)
      ) {
        // Wait for the latest semester and course list before allowing another submission.
        refresh(() => router.refresh());
      }
    }
  }

  return (
    <Surface className="u-stack" aria-label="Available courses">
      <h2>Available courses</h2>
      <AcademicMetrics
        label="Credit limits"
        items={[
          { label: "Registered units", value: available.registeredUnits },
          { label: "Semester limit", value: available.maxUnits },
          { label: "Remaining units", value: remaining },
        ]}
      />
      {available.courses.length === 0 ? (
        <ResourceState
          state="empty"
          title="No courses are available"
          detail="Courses that are already registered or closed for registration do not appear here."
        />
      ) : (
        <>
          <fieldset className="min-w-0" disabled={busy}>
            <legend className="sr-only">Select eligible courses</legend>
            <ul className="student-course-list">
              {available.courses.map(({ offeringId, courseId, code, name, units }) => {
                const checked = selectedIds.has(offeringId);
                return (
                  <li key={offeringId}>
                    <Checkbox
                      label={code + " · " + name + " (" + units + " credit units)"}
                      checked={checked}
                      disabled={
                        !checked &&
                        (selectedCourseIds.has(courseId) || selection.length >= 100)
                      }
                      onChange={(event) => {
                        const next = event.target.checked;
                        setChosen((previous) =>
                          next
                            ? [...previous, offeringId]
                            : previous.filter((id) => id !== offeringId),
                        );
                      }}
                    />
                  </li>
                );
              })}
            </ul>
          </fieldset>
          <div className="u-stack">
            <p role="status">
              {refreshing
                ? "Refreshing available courses…"
                : selection.length + " selected · " + selectedUnits + " credit units"}
            </p>
            {excess > 0 && (
              <Banner tone="warning">
                Remove at least {excess} {excess === 1 ? "credit unit" : "credit units"}{" "}
                to stay within your limit.
              </Banner>
            )}
            <div>
              <Button
                disabled={!canSubmit}
                pending={pending}
                onClick={() => setReviewing(true)}
              >
                {pending ? "Registering courses" : "Review selection"}
              </Button>
            </div>
          </div>
        </>
      )}
      {error && <Banner tone="danger">{error}</Banner>}
      <RegistrationDialog
        open={reviewing}
        close={() => setReviewing(false)}
        courses={selection}
        totalUnits={available.registeredUnits + selectedUnits}
        maxUnits={available.maxUnits}
        pending={pending}
        canSubmit={canSubmit}
        confirm={() => void register()}
      />
    </Surface>
  );
}
