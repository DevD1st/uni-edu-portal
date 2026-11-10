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

Use a separate non-production database named `uemp_demo` (or `uemp_demo_*`). The demo seed checks the database name to avoid creating sample accounts in a regular application database. Configure `DEMO_SEED_PASSWORD` with at least 7 characters and no more than 72 UTF-8 bytes. On a fresh database, all seven fictitious accounts use that password. Keep it in the local environment and share it separately with evaluators.

Start Compose with the demo override as shown in the [backend README](../backend/README.md#run-the-demo). The migration service seeds the sample data automatically after the migrations succeed. For a setup without Compose, apply the migrations, then run `npm run build` and `npm run demo:seed` from `backend/`.

The script accepts dedicated non-production demo and test databases. If the original demo is already present, the script adds the new students and offerings to its active Computing programme and current semester. Existing accounts, passwords, rosters, and grades stay intact. The added accounts use the password supplied on that run. Subsequent runs leave the seeded data intact.

A fresh seed creates six active offerings with seven enrollments across three students. The fourth student starts with an empty registration history. Two courses have published grades, two are awaiting HOD review, one has an open draft roster, and one is available for new registration.

| Sign-in email | Account type | What to try |
| --- | --- | --- |
| `student@demo.example.test` | `student` | View the approved `DEMO101` grade and register for available `DEMO104`. Submitted and pending marks stay hidden. |
| `student-maya@demo.example.test` and `student-theo@demo.example.test` | `student` | Both are registered for `DEMO105` and `DEMO106`. Compare their published B and C grades for `DEMO105` while `DEMO106` awaits approval. |
| `student-nora@demo.example.test` | `student` | Start from an empty registration history and register for `DEMO104`. |
| `lecturer@demo.example.test` | `admin` | Open the assigned `DEMO103` roster, close registration, enter both marks, and submit. |
| `hod@demo.example.test` | `admin` | Read the Demo Computing reports and approve or return `DEMO102` or `DEMO106`. |
| `super-admin@demo.example.test` | `admin` | Read the university overview and audit trail, and manage academic setup and staff. |

After approving `DEMO102`, sign in as the student and check the statement and GPA. Reopen it as the HOD and confirm the result disappears until it is approved again. Use the exact semester and group IDs returned by the API; they are generated when the seed runs.
