"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@uemp/web-client";
import { ClipboardList } from "lucide-react";
import {
  Badge,
  Banner,
  Button,
  Checkbox,
  ResourceState,
  Surface,
  TextField,
  useClientReady,
} from "@uemp/ui";
import { AcademicMetrics } from "../../portal/components/academic-metrics";
import { StudentSectionHeading } from "../../portal/components/student-section-heading";
import { portalApi, studentError } from "../../portal/student-request";
import {
  readRegistrationSummary,
  type AvailableCourses,
  type RegistrationInput,
} from "../contracts";
import { RegistrationDialog } from "./registration-dialog";

export function CourseSelection({ available }: { available: AvailableCourses }) {
  const router = useRouter();
  const ready = useClientReady();
  const [chosen, setChosen] = useState<string[]>([]);
  const [search, setSearch] = useState("");
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
  const busy = !ready || pending || refreshing;
  const canSubmit =
    !busy && selection.length > 0 && selection.length <= 100 && excess <= 0;
  const query = search.trim().toLocaleLowerCase();
  // Search changes what is visible, never the courses already selected for review.
  const visibleCourses = available.courses.filter((course) =>
    (course.code + " " + course.name).toLocaleLowerCase().includes(query),
  );

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
      <StudentSectionHeading
        title="Available courses"
        icon={ClipboardList}
        description="Choose your courses, check the credit total, then review your selection."
        meta={
          <Badge>
            {available.courses.length}{" "}
            {available.courses.length === 1 ? "course" : "courses"}
          </Badge>
        }
      />
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
          <TextField
            label="Find a course"
            type="search"
            value={search}
            placeholder="Search by course code or title"
            hint="Your selections are kept when you search."
            disabled={busy}
            onChange={(event) => setSearch(event.target.value)}
          />
          <fieldset className="min-w-0" disabled={busy}>
            <legend className="sr-only">Select eligible courses</legend>
            <ul className="student-course-options">
              {visibleCourses.map(({ offeringId, courseId, code, name, units }) => {
                const checked = selectedIds.has(offeringId);
                return (
                  <li key={offeringId} data-selected={checked}>
                    <Checkbox
                      label={
                        <span className="student-course-option">
                          <strong>{code}</strong>
                          <span className="student-course-name">
                            <span className="sr-only"> · </span>
                            {name}
                          </span>
                          <span className="student-course-units">
                            {" "}
                            ({units} credit units)
                          </span>
                        </span>
                      }
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
            {visibleCourses.length === 0 && (
              <ResourceState
                state="empty"
                title="No matching courses"
                detail="Try a different course code or title. Your selected courses are still included in the credit total."
              />
            )}
          </fieldset>
          <div className="student-selection-summary u-stack">
            <p role="status" className="student-selection-count">
              {refreshing
                ? "Refreshing available courses…"
                : selection.length + " selected · " + selectedUnits + " credit units"}
            </p>
            <progress
              className="student-unit-progress"
              data-exceeded={excess > 0}
              aria-label="Semester credit usage"
              value={Math.min(
                available.maxUnits,
                available.registeredUnits + selectedUnits,
              )}
              max={Math.max(1, available.maxUnits)}
            />
            {excess > 0 && (
              <Banner tone="warning">
                Remove at least {excess} {excess === 1 ? "credit unit" : "credit units"}{" "}
                to stay within your limit.
              </Banner>
            )}
            <div className="student-selection-actions u-actions">
              <Button
                variant="ghost"
                disabled={busy || selection.length === 0}
                onClick={() => setChosen([])}
              >
                Clear selection
              </Button>
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
