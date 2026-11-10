# Results workflow

This guide covers lecturer marks, departmental decisions, and student result statements. See the [approved schema](schema-review.md#grading-and-approval) for the underlying records and the [backend README](../backend/README.md) for startup and Swagger access.

## Routes and permissions

Send a Bearer access token. Staff sign in with account role `admin`; the Lecturer, HOD, and other staff roles are grants on that account. Each required privilege must come from a grant that covers the offering's department or from a university-wide grant. For example, a grant to teach in Computing and a grant to grade in Mathematics do not permit grading in Computing. The department that owns an offering also owns its review, even when the same catalog course is used by multiple programmes. A lecturer with `approve_result` for that department can approve their own submission.

| Method and route | Required access | Result |
| --- | --- | --- |
| `GET /v1/lecturer/results` | `teach_course` and assigned lecturer | Lists assigned result groups. |
| `GET /v1/lecturer/results/{resultGroupId}` | `teach_course` and assigned lecturer | Reads the result group and a page of its roster marks. |
| `POST /v1/lecturer/offerings/{offeringId}/close-registration` | `teach_course` and assigned lecturer | Permanently closes a roster after the first enrollment. |
| `PATCH /v1/lecturer/results/{resultGroupId}/marks` | `teach_course`, `grade_result`, and assigned lecturer | Saves marks in one batch. |
| `POST /v1/lecturer/results/{resultGroupId}/submit` | `teach_course`, `grade_result`, and assigned lecturer | Submits the complete, closed roster for review. |
| `GET /v1/admin/results?departmentId={departmentId}` | Any of `review_result`, `approve_result`, or `reopen_result` for that department | Lists groups previously submitted in the department. Defaults to `status=submitted`. |
| `GET /v1/admin/results/{resultGroupId}` | Any of `review_result`, `approve_result`, or `reopen_result` for the owning department | Reads a previously submitted group and a page of its roster marks. |
| `POST /v1/admin/results/{resultGroupId}/approve` | `approve_result` for the owning department | Awards and publishes all grades for the submitted group. |
| `POST /v1/admin/results/{resultGroupId}/request-corrections` | `review_result` for the owning department | Returns a submitted group to the lecturer with feedback. |
| `POST /v1/admin/results/{resultGroupId}/reopen` | `reopen_result` for the owning department | Returns a submitted or approved group to `pending` and withdraws any awarded grades. |
| `GET /v1/student/results` | Student account | Reads the signed-in student's terms, approved units, semester GPAs, and CGPA. |
| `GET /v1/student/results/{semesterId}` | Student account with a saved record for that semester | Reads the student's approved courses and GPA figures as JSON. |
| `GET /v1/student/results/{semesterId}/statement/download` | Student account with a saved record for that semester | Downloads the same statement as UTF-8 `result-statement.txt`. |

The lecturer must match the current assignment on both the offering and the result group for result access. The `resultGroupId` identifies a specific offering's result group; the `offeringId` identifies the delivery itself. A mark uses the roster's `enrollmentId`. Student routes use the academic `semesterId`, which is different from the student's saved semester record `id`. All are UUIDs. Student routes derive the student from the access token and never accept a student ID. Inactive accounts and revoked sessions cannot access the workflow.

Both staff lists support `semesterId` and `status`; lecturer lists have no default status filter. `status` accepts `pending`, `submitted`, `correction_requested`, or `approved`. In the department queue, a group filtered by `pending` was previously submitted and later reopened. Staff lists and details accept `limit` (1–100, default 25) and `cursor`; send the returned `nextCursor` on the next request with the same filters. List results are in `items`; detail rows are in `marks`. A null `nextCursor` means there is no next page. Group summaries report the roster size, number of complete mark entries, and average total across complete entries. A detail row with both marks shows a grade preview from the pinned grading scale.

## Save, submit, and review

1. Enroll students while the roster is open. Close registration once the roster has at least one enrollment. Closing an already closed roster returns its existing closure. Closing does not prevent mark entry, and no result action reopens registration or permits late enrollment.
2. Save marks while the group is `pending` or `correction_requested`. A batch must contain 1–100 distinct enrollments from this group and at least one score field per enrollment. Omit a score to preserve it or send `null` to clear it. Numeric marks must have at most two decimal places and fall between zero and the limit for that component. One invalid entry rejects the whole batch. The response contains the group `id` and `changedCount`; resending identical marks reports zero changes.
3. Submit when the roster is closed and every enrollment has both CA and exam marks. A successful submission changes the group to `submitted` and locks marks until corrections are requested or the group is reopened. `submit` and `approve` accept an optional `note` (or `null`); notes are trimmed and must contain 1–1,000 characters when provided.
4. From `submitted`, approve the group or send it back as `correction_requested`. To return it, send `{ "reason": "Check the exam marks against the course record." }`. The trimmed reason must contain 1–1,000 characters. Existing marks stay in place, the lecturer sees the feedback, and the lecturer can save changes and resubmit. Keep personal information out of staff notes and feedback.
5. If a submitted or approved group needs to be reopened, send a `reason` of `mark_correction`, `review_error`, or `administrative_request`. Reopening takes the group back to `pending`, preserves marks, and clears awards. The roster stays closed. Resubmit and approve it again to publish. The timestamps and notes report the latest recorded actions; the current `status` controls availability.

For example, to save both marks for one enrollment and clear only the exam mark for another:

```json
{
  "marks": [
    {
      "enrollmentId": "0191e192-67ad-746b-9acb-c850234b408a",
      "caScore": 24.5,
      "examScore": 49.25
    },
    {
      "enrollmentId": "0191e192-67ad-746b-9acb-c850234b408b",
      "examScore": null
    }
  ]
}
```

## Publication and grading

Approval awards every enrolled student's grade and publishes the group in one transaction. Student history, JSON statements, and downloads include only awards from currently `approved` groups with a grade from the offering's pinned policy. Draft, submitted, and returned marks never appear in those responses. Reopening an approved group removes its rows and units from statements and GPA totals immediately after the transaction commits. A saved semester can still appear before it has results, with `approvedUnits: 0`, `gpa: null`, and an empty `courses` array in its statement. Student result responses use `Cache-Control: no-store`. The printable statement shows two decimals and displays unavailable averages as `Unavailable`.

Each offering pins the grading policy used for mark limits, previews, and awards. The default policy scores CA out of 30 and the exam out of 70. The total is the sum of the two marks. Activated policy versions and their bands are immutable, including after retirement; a later policy does not change awards for offerings pinned to an earlier version.

| Total score (inclusive) | Letter | Grade points per unit |
| --- | --- | ---: |
| 70.00–100.00 | A | 5 |
| 60.00–69.99 | B | 4 |
| 50.00–59.99 | C | 3 |
| 45.00–49.99 | D | 2 |
| 40.00–44.99 | E | 1 |
| 0.00–39.99 | F | 0 |

For each approved course, multiply its recorded credit units by its awarded grade points. Semester GPA is the sum of those products divided by the sum of approved units in that semester. CGPA does the same across every currently approved attempt in all semesters. Both are rounded to two decimals only after division. CGPA uses the original credit points, never the displayed term GPAs. A failed course adds its units and zero points. Approved attempts at a repeated course count separately in their respective terms. A GPA or CGPA is `null` when it has no approved units; a failing average is `0`.

For example, a three-unit A in the first term gives 15 credit points. In the second term, a two-unit F and four-unit B give 16 credit points over six units. The second term GPA is `16 / 6 = 2.67`; CGPA is `31 / 9 = 3.44`. Reopening the first term's course withdraws its three units and 15 points, making CGPA `2.67` until reapproval.

## Audit, concurrency, and errors

Staff reads resolve current grants and result data in the same database snapshot. Result writes lock the offering before the result group and recheck authorization, assignment where applicable, and state in the transaction. Approval, award writes, and their success audit either all commit or all roll back. A concurrent request that finds a changed state must refresh before retrying. Student statements and their totals are read from one database snapshot.

The audit trail records `result.marks.save`, `result.grade.award`, and `result.grade.clear` per changed enrollment. It records `result.submit`, `result.approve`, `result.request_corrections`, and `result.reopen` per group, and `registration.close_roster` for roster closure. Reopening records its reason code. Audit rows use internal IDs, safe change details, and available request and trace IDs. Raw notes and correction feedback are excluded from audit payloads and student statements. When an account is deleted, direct matches for its email, matriculation number, and full name are removed from stored notes and feedback while the result history remains intact. Audit reads require the university-wide `read_audit` privilege. Denials and failed operations are recorded when possible; successful result changes require a successful audit write.

The HTTP error DTO returns `statusCode` and a readable `message`, with field-level `errors` and `requestId` or `traceId` when available. Use the request ID to correlate an error with the logs. The API does not return SQL, raw database errors, or submitted values as diagnostics.

| Status | What to check |
| --- | --- |
| `400` | Fix invalid input, such as a malformed mark, duplicate enrollment, or invalid reason. |
| `401` | Sign in again if the access token is missing, invalid, expired, or revoked. |
| `403` | Check account type, assignment, and each required privilege in the owning department. |
| `404` | Check the ID, whether the student has a saved record for the semester, or whether the result group was ever submitted. |
| `409` | Refresh the group and check its state, registration closure, and mark completeness before retrying. |
| `503` | A required audit write failed. The result change was rolled back; retry after the service recovers. |

## Verify locally

From `backend/`, run `npm run typecheck`, `npm test`, and `npm run test:integration`. Set up the disposable PostgreSQL and Redis services and test settings described in the [backend README](../backend/README.md#verify). The integration fixture exercises assignment and split-department grants, draft and submitted visibility, correction and reapproval, concurrent approvals, rollback after an audit failure, statement downloads, and weighted GPA and CGPA across terms. To check result reads with a minimal pool, set `POSTGRES_POOL_MAX=1` and exercise the lecturer and departmental list and detail routes concurrently.
