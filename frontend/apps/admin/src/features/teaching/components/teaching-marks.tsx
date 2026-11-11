import { useState } from "react";
import { Banner, Button, DescriptionList, ResourceState } from "@uemp/ui";
import type { Dto } from "@uemp/api-contracts/response";
import { hasPrivilege, permits } from "../../access/policy";
import {
  ActionNotice,
  CursorControls,
  NoteField,
  StaffDialog,
  StaffResource,
  textField,
} from "../../portal/components/staff-controls";
import {
  staffPath,
  useCursor,
  useStaffAccess,
  useStaffAction,
  useStaffResource,
  writeStaff,
} from "../../portal/staff-data";
import { MarksEditor } from "./marks-editor";
import { ResultMarks } from "./result-marks";
import { markText, ResultStatus } from "./result-status";

const grading = { anyOf: [["teach_course", "grade_result"]] } as const;

export function TeachingMarks({
  groupId,
  offeringId,
  departmentId,
  registrationClosed,
  dirty,
  onDirty,
}: {
  groupId: string;
  offeringId: string;
  departmentId: string;
  registrationClosed: boolean;
  dirty: boolean;
  onDirty: (dirty: boolean) => void;
}) {
  const { grants, adminId } = useStaffAccess();
  const cursor = useCursor();
  const path = "/v1/lecturer/results/" + groupId;
  const resource = useStaffResource(
    staffPath(path, { cursor: cursor.value }),
    "ResultGroupDetailDto",
  );
  const action = useStaffAction();
  const [submitting, setSubmitting] = useState(false);

  return (
    <StaffResource resource={resource} title="roster marks">
      {(group) => {
        if (
          group.lecturerId !== adminId ||
          group.offeringId !== offeringId ||
          group.departmentId !== departmentId ||
          !hasPrivilege(grants, "teach_course", departmentId)
        )
          return (
            <ResourceState
              state="restricted"
              title="This roster is outside your teaching assignment"
            />
          );
        const editable =
          permits(grants, grading, departmentId) &&
          (group.status === "pending" || group.status === "correction_requested");
        const complete =
          group.enrolledCount > 0 && group.markedCount === group.enrolledCount;
        const closed = registrationClosed || group.registrationStatus === "closed";
        const canSubmit = editable && closed && complete && !dirty;
        return (
          <section className="u-stack" aria-label="Marks and submission">
            <div className="u-actions">
              <h2>Marks and submission</h2>
              <ResultStatus status={group.status} />
              <Button
                variant="secondary"
                disabled={dirty || action.pending}
                onClick={resource.reload}
              >
                Refresh results
              </Button>
            </div>
            <DescriptionList
              items={[
                {
                  label: "Complete marks",
                  value: group.markedCount + " of " + group.enrolledCount,
                },
                { label: "Average total", value: markText(group.averageScore) },
                {
                  label: "Registration",
                  value: closed ? "Closed" : "Open",
                },
              ]}
            />
            {group.status === "correction_requested" &&
              group.correctionRequestReason && (
                <Banner tone="warning">{group.correctionRequestReason}</Banner>
              )}
            {group.submissionReason && (
              <p>Submission note · {group.submissionReason}</p>
            )}
            {group.approvalReason && <p>Approval note · {group.approvalReason}</p>}
            {!submitting && (
              <ActionNotice error={action.error} success={action.success} />
            )}
            {editable && group.marks.length > 0 ? (
              <MarksEditor
                key={cursor.value ?? "first"}
                group={group}
                pending={action.pending}
                onDirty={onDirty}
                save={(input) =>
                  void action.run(
                    () =>
                      writeStaff(
                        path + "/marks",
                        "PATCH",
                        "SaveMarksResponseDto",
                        input,
                      ),
                    "Marks saved.",
                    () => {
                      onDirty(false);
                      resource.reload();
                    },
                  )
                }
              />
            ) : (
              <ResultMarks marks={group.marks} />
            )}
            <CursorControls
              cursor={cursor}
              next={group.nextCursor}
              disabled={dirty || action.pending}
            />
            {editable && (
              <div className="u-stack">
                {!closed && (
                  <p className="u-muted">
                    Close registration in the class roster before submitting.
                  </p>
                )}
                {!complete && (
                  <p className="u-muted">
                    Enter both scores for every student before submitting.
                  </p>
                )}
                {dirty && (
                  <p className="u-muted">
                    Save or discard your edits before changing pages or submitting.
                  </p>
                )}
                <div>
                  <Button
                    disabled={!canSubmit || action.pending}
                    onClick={() => setSubmitting(true)}
                  >
                    Submit for review
                  </Button>
                </div>
              </div>
            )}
            {submitting && (
              <StaffDialog
                title="Submit results for review"
                label="Submit results"
                close={() => setSubmitting(false)}
                pending={action.pending}
                error={action.error}
                submit={(form) => {
                  const input: Dto<"ResultDecisionNoteDto"> = {
                    note: textField(form, "note") || null,
                  };
                  void action.run(
                    () =>
                      writeStaff(
                        path + "/submit",
                        "POST",
                        "ResultStateResponseDto",
                        input,
                      ),
                    "Results submitted for departmental review.",
                    () => {
                      setSubmitting(false);
                      resource.reload();
                    },
                  );
                }}
              >
                <p>Submitting locks the marks while the department reviews them.</p>
                <NoteField label="Submission note (optional)" name="note" />
              </StaffDialog>
            )}
          </section>
        );
      }}
    </StaffResource>
  );
}
