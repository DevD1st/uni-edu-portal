import { useState } from "react";
import { Link, Route, Routes, useParams } from "react-router";
import {
  Banner,
  Button,
  DataTable,
  DescriptionList,
  PageHeader,
  ResourceState,
  Surface,
} from "@uemp/ui";
import { isUuid, type Dto } from "@uemp/api-contracts/response";
import { hasPrivilege, permits, reviewRule } from "../../access/policy";
import {
  ActionNotice,
  ChoiceField,
  CursorControls,
  NoteField,
  StaffDialog,
  StaffResource,
  namedOptions,
  textField,
  requiredText,
} from "../../portal/components/staff-controls";
import {
  staffPath,
  useCursor,
  useStaffAccess,
  useStaffAction,
  useStaffResource,
  writeStaff,
} from "../../portal/staff-data";
import { ResultMarks } from "../../teaching/components/result-marks";
import { StaffNotFound } from "../../portal/components/staff-not-found";
import {
  markText,
  ResultStatus,
  resultLabels,
  type ResultStatusValue,
} from "../../teaching/components/result-status";

const root = "/workspaces/result-review";
const api = "/v1/admin/results";
const statusOptions = Object.entries(resultLabels).map(([value, label]) => ({
  value,
  label,
}));
const reasons = [
  { value: "mark_correction", label: "Mark correction" },
  { value: "review_error", label: "Review error" },
  { value: "administrative_request", label: "Administrative request" },
] as const;

function Queue({
  departmentId,
  status,
}: {
  departmentId: string;
  status: ResultStatusValue;
}) {
  const cursor = useCursor();
  const resource = useStaffResource(
    staffPath(api, { departmentId, status, cursor: cursor.value }),
    "ResultGroupPageDto",
  );
  return (
    <StaffResource resource={resource} title="departmental results">
      {({ items, nextCursor }) => (
        <>
          {items.length ? (
            <DataTable
              caption="Departmental results"
              columns={[
                { label: "Code" },
                { label: "Course" },
                { label: "Status" },
                { label: "Complete marks", numeric: true },
              ]}
            >
              {items.map((item) => (
                <tr key={item.id}>
                  <th scope="row">
                    <Link to={root + "/" + item.id} className="u-text-link">
                      {item.code}
                    </Link>
                  </th>
                  <td>{item.name}</td>
                  <td>
                    <ResultStatus status={item.status} />
                  </td>
                  <td data-numeric>
                    {item.markedCount} of {item.enrolledCount}
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <ResourceState
              state="empty"
              title={
                status === "submitted"
                  ? "No submitted results to show"
                  : "No results match these filters"
              }
            />
          )}
          <CursorControls cursor={cursor} next={nextCursor} />
        </>
      )}
    </StaffResource>
  );
}

function ReviewQueue() {
  const { grants } = useStaffAccess();
  const resource = useStaffResource(api + "/options", "ResultReviewOptionsDto");
  const [selected, select] = useState("");
  const [status, setStatus] = useState<ResultStatusValue>("submitted");
  return (
    <Surface className="u-stack">
      <StaffResource resource={resource} title="departments">
        {({ departments }) => {
          const eligible = departments.filter(({ id }) =>
            permits(grants, reviewRule, id),
          );
          const departmentId =
            eligible.find(({ id }) => id === selected)?.id ?? eligible[0]?.id;
          if (!departmentId)
            return (
              <ResourceState state="empty" title="No departments available to review" />
            );
          return (
            <>
              <div className="staff-fields">
                <ChoiceField
                  label="Department"
                  value={departmentId}
                  options={namedOptions(eligible)}
                  emptyLabel={null}
                  onChange={(event) => select(event.target.value)}
                />
                <ChoiceField
                  label="Result status"
                  value={status}
                  options={statusOptions}
                  emptyLabel={null}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value in resultLabels) setStatus(value as ResultStatusValue);
                  }}
                />
              </div>
              <Queue
                key={departmentId + ":" + status}
                departmentId={departmentId}
                status={status}
              />
            </>
          );
        }}
      </StaffResource>
    </Surface>
  );
}

type Decision = "approve" | "request-corrections" | "reopen";
const decisionText = {
  approve: {
    title: "Approve and publish results",
    detail: "Approval publishes grades to the enrolled students.",
    done: "Results published.",
  },
  "request-corrections": {
    title: "Request corrections",
    detail: "The lecturer can edit the marks and resubmit this result group.",
    done: "Corrections requested.",
  },
  reopen: {
    title: "Reopen result group",
    detail:
      "Reopening withdraws published grades and returns the group to draft. The roster stays closed.",
    done: "Results reopened.",
  },
};

function decisionInput(decision: Decision, form: FormData) {
  if (decision === "approve")
    return {
      note: textField(form, "note") || null,
    } satisfies Dto<"ResultDecisionNoteDto">;
  if (decision === "request-corrections")
    return {
      reason: requiredText(form, "reason", "the correction feedback"),
    } satisfies Dto<"RequestResultCorrectionsDto">;
  const reason = reasons.find(({ value }) => value === form.get("reason"))?.value;
  if (!reason) throw new Error("Choose a reopening reason.");
  return { reason } satisfies Dto<"ReopenResultDto">;
}

function ReviewDetail() {
  const { resultId } = useParams();
  const { grants } = useStaffAccess();
  const cursor = useCursor();
  const path = isUuid(resultId) ? api + "/" + resultId : null;
  const resource = useStaffResource(
    path && staffPath(path, { cursor: cursor.value }),
    "ResultGroupDetailDto",
  );
  const action = useStaffAction();
  const [decision, setDecision] = useState<Decision>();
  function open(value: Decision) {
    action.reset();
    setDecision(value);
  }
  if (!path)
    return (
      <ResourceState
        state="restricted"
        title="Choose a result from the department queue"
      />
    );

  return (
    <div className="u-stack">
      <Link to={root} className="u-text-link">
        Back to result review
      </Link>
      <StaffResource resource={resource} title="result group">
        {(group) => {
          if (!permits(grants, reviewRule, group.departmentId))
            return (
              <ResourceState
                state="restricted"
                title="This result is outside your departments"
              />
            );
          const submitted = group.status === "submitted";
          const approve =
            submitted && hasPrivilege(grants, "approve_result", group.departmentId);
          const correct =
            submitted && hasPrivilege(grants, "review_result", group.departmentId);
          const reopen =
            (submitted || group.status === "approved") &&
            hasPrivilege(grants, "reopen_result", group.departmentId);
          return (
            <>
              <PageHeader title={group.code + " · " + group.name} />
              <Surface className="u-stack">
                <div className="u-actions">
                  <h2>Departmental review</h2>
                  <ResultStatus status={group.status} />
                  <Button
                    variant="secondary"
                    disabled={action.pending}
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
                  ]}
                />
                {group.submissionReason && (
                  <p>Submission note · {group.submissionReason}</p>
                )}
                {group.approvalReason && <p>Approval note · {group.approvalReason}</p>}
                {group.correctionRequestReason && (
                  <Banner tone="warning">{group.correctionRequestReason}</Banner>
                )}
                {!decision && (
                  <ActionNotice error={action.error} success={action.success} />
                )}
                <ResultMarks marks={group.marks} />
                <CursorControls cursor={cursor} next={group.nextCursor} />
                <div className="u-actions">
                  {approve && (
                    <Button onClick={() => open("approve")}>Approve and publish</Button>
                  )}
                  {correct && (
                    <Button
                      variant="secondary"
                      onClick={() => open("request-corrections")}
                    >
                      Request corrections
                    </Button>
                  )}
                  {reopen && (
                    <Button variant="secondary" onClick={() => open("reopen")}>
                      Reopen results
                    </Button>
                  )}
                </div>
              </Surface>
              {decision && (
                <StaffDialog
                  title={decisionText[decision].title}
                  label={decisionText[decision].title}
                  close={() => setDecision(undefined)}
                  error={action.error}
                  pending={action.pending}
                  danger={decision === "reopen"}
                  submit={(form) =>
                    void action.run(
                      () =>
                        writeStaff(
                          path + "/" + decision,
                          "POST",
                          "ResultStateResponseDto",
                          decisionInput(decision, form),
                        ),
                      decisionText[decision].done,
                      () => {
                        setDecision(undefined);
                        resource.reload();
                      },
                    )
                  }
                >
                  <p>{decisionText[decision].detail}</p>
                  {decision === "approve" && (
                    <NoteField label="Approval note (optional)" name="note" />
                  )}
                  {decision === "request-corrections" && (
                    <NoteField label="Correction feedback" name="reason" required />
                  )}
                  {decision === "reopen" && (
                    <ChoiceField
                      label="Reopening reason"
                      name="reason"
                      options={reasons}
                      required
                    />
                  )}
                </StaffDialog>
              )}
            </>
          );
        }}
      </StaffResource>
    </div>
  );
}

export function ReviewWorkspace() {
  return (
    <Routes>
      <Route index element={<ReviewQueue />} />
      <Route path=":resultId" element={<ReviewDetail />} />
      <Route
        path="*"
        element={<StaffNotFound to={root} label="Back to result review" />}
      />
    </Routes>
  );
}
