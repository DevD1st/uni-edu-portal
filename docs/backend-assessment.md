# Assessment backend coverage

This checklist uses the project's agreed scope of all workflows. See [backend setup](../backend/README.md) for installation, configuration, Swagger, and tests; see the [schema](schema-review.md) for persistence and the [results guide](results-workflow.md) for the marks and approval contract.

| Assessment area | Backend implementation | Verification |
| --- | --- | --- |
| Secure access and four working role experiences | Sign-in, token refresh and revocation, role-specific privileges, department grants, assignment checks, and account management. Student is an account type. Lecturer, HOD, and Super Admin are staff role grants and can coexist on one account. | Account integration checks separate identities, session rotation, suspension, revocation, scope denial, and that sensitive responses are not cached. Deletion tests verify that result notes and rosters lose direct identifiers while grades remain. The demo checks that all four role accounts can sign in. |
| Academic setup and administrative oversight | Faculties, departments, programmes, sessions, semesters, fixed academic levels, course catalog, curriculum links, and departmental offerings. University managers can activate or deactivate shared level references. HODs manage programme, offering, and placement choices inside their department and can provision eligible lecturers. | Setup checks include scoped lecturer profile changes and denial of university-wide level changes for an HOD. |
| Student course registration | Uses the faculty's current active semester and the student's programme, department, and level. Prevents duplicates and over-registration. Registration totals, available courses, and roster permissions each use a consistent database snapshot. Supports printable summaries. | Integration verifies student and delegated registration, term snapshots, two departments offering one catalog course, concurrent selection, and permanent roster closure. |
| Lecturer roster and marks | Assigned offering lists and class rosters, batch CA/exam marks, saved drafts, submission, decision history, and per-course counts and averages. | Integration checks assignment changes, split grants, mark bounds and clearing, complete marks, closure, and submission locking. |
| Departmental review and student publication | Scoped queue, approval, corrections with feedback, and reopening. Students see only their own approved awards and printable statements. | Integration checks denied cross-department decisions, rollback when required audit fails, concurrent approval, withdrawal on reopen, and reapproval. |
| GPA and CGPA | Uses pinned grading versions and approved credit units, including failed and repeated attempts. The default grading policy is documented. | Integration checks grade boundaries, approved-only statements, weighted averages across terms, and rounding after division. |
| Reports and Super Admin monitoring | Department registration lists; semester-level overview and course performance reports; university-wide rollups; administrative audit activity. | Integration checks report scope, pagination, counts, published-only marks, and withdrawal on reopen. |
| Validation, persistence, and instrumentation | DTOs and Swagger examples, public validation and database error mapping, migrations, immutable audit records, PostgreSQL and Redis readiness, and structured logging. | Type checking, unit tests, live integration, OpenAPI contract checks, and `npm audit --omit=dev`. |
| Sample data and technical handoff | A repeatable demo seed, setup instructions, database schema, and runnable examples for all roles. | Integration runs the seed twice concurrently and uses its sign-ins and published, submitted, pending, and unregistered fixtures. |

The assessment's browser dashboards, responsive UI, hosted evaluation URL, and recorded or live walkthrough are delivery items beyond the backend. Fees, accommodation, admissions, biometrics, SMS and email gateways, mobile apps, transcript certification, and live university integrations are outside the stated assessment scope.

## Academic reporting

Both endpoints take a required `semesterId` and an optional `departmentId`. Select IDs from academic setup or your configured semester. An explicit department requires `read_reports` from a grant for that department or a university-wide grant. Omitting it requires university-wide `read_reports`. An ordinary Lecturer grant gives access to assigned-course summaries and rosters through the lecturer routes. Add an explicit reporting grant only when the person needs department or university oversight.

| Route | Response |
| --- | --- |
| `GET /v1/admin/reports/overview?semesterId={id}&departmentId={id}` | Counts configured and active offerings, closed rosters, each current result state, distinct students with an enrollment, total enrollments, published results, and passing results. The average includes only published marks. |
| `GET /v1/admin/reports/courses?semesterId={id}&departmentId={id}` | Offering-level enrollment and published performance counts, department and course labels, academic level, and current offering, roster, and result status. |

The course report orders by offering ID and returns `items` with `nextCursor`. Pass that cursor with the same semester and department to continue. `limit` is 1–100 and defaults to 25. An offering that has no result group has null roster and result statuses. An empty valid scope has zero counts and a null average. Inactive and empty offerings remain visible so staff can reconcile historic registrations.

An approved result counts only if its award matches the offering's pinned policy. Passes exclude grade F. The average is the arithmetic mean of approved total marks out of 100, rounded to two decimals; it is separate from the credit-weighted student GPA. Draft, submitted, and correction-requested marks do not contribute. Reopening drops withdrawn grades from the aggregates without removing enrollment counts. Reports return aggregate data without student names or individual marks and use `Cache-Control: no-store`. See `GET /v1/admin/registrations` for authorized departmental enrollment lists and `GET /v1/admin/audit-events` for university-wide activity.

## Demo walkthrough

Use a separate non-production database named `uemp_demo` (or `uemp_demo_*`). Configure `DEMO_SEED_PASSWORD` with at least 12 characters and no more than 72 UTF-8 bytes. It is the password for the four fictitious accounts. Keep it in the local environment and share it separately with evaluators.

After applying migrations, run `npm run build` and `npm run demo:seed` from `backend/`, or run `docker compose --env-file backend/.env exec backend npm run demo:seed` once Compose is ready. The script refuses production and ordinary database names. Running it again leaves existing data and passwords untouched. To start over, create a fresh demo database and run migrations and the seed there.

| Sign-in email | Account type | What to try |
| --- | --- | --- |
| `student@demo.example.test` | `student` | View the approved `DEMO101` grade and register for available `DEMO104`. Submitted and pending marks stay hidden. |
| `lecturer@demo.example.test` | `admin` | Open the assigned `DEMO103` roster, close registration, enter both marks, and submit. |
| `hod@demo.example.test` | `admin` | Read the Demo Computing reports, approve or return `DEMO102`, and review the newly submitted group. |
| `super-admin@demo.example.test` | `admin` | Read the university overview and audit trail, and manage academic setup and staff. |

After approving `DEMO102`, sign in as the student and check the statement and GPA. Reopen it as the HOD and confirm the result disappears until it is approved again. Use the exact semester and group IDs returned by the API; they are generated when the seed runs.
