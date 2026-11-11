# Reviewer guide

Use this guide to explore the application and locate the supporting technical delivery. Open the hosted [student portal](https://uemp-student.onrender.com/sign-in) or [staff portal](https://uemp-admin.onrender.com/sign-in); the [demo accounts](../README.md#demo-access-and-walkthrough) cover student, lecturer, HOD, and Super Admin access.

The [main README](../README.md#run-the-complete-application) also provides the two-command local setup, local and hosted portal URLs, and local Swagger access. The supplied `.env.example` contains working local configuration; no external services or host Node.js installation are needed for the Docker route.

## Delivered capabilities and evidence

| Deliverable                                  | Where to review it                                                                                                                                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Student application                          | Next.js portal: signup, profile, academic placement, registration/history, published grades, GPA/CGPA, and print views; [student source](../frontend/apps/student/)                            |
| Lecturer and administrative application      | React staff portal: teaching, review, setup, people, roles, registration oversight, reports, and audit; [staff source](../frontend/apps/admin/)                                                |
| Backend and API contracts                    | Nest feature modules, DTOs, guards, handlers, and services; [API guide](../backend/README.md) and local Swagger `/docs`                                                                        |
| System architecture and technology rationale | [Architecture](architecture.md), including request flow, CQRS/saga boundaries, concurrency, instrumentation, and deployment tradeoffs                                                          |
| Database schema and ER diagram               | [Database design](database.md): full ERD, focused diagrams, every property, keys, constraints, deletion behavior, and migrations                                                               |
| Security implementation                      | [Security](security.md): account types, scoped grants, authorization examples, token rotation/expiry/logout, validation, audits, and redaction                                                 |
| Academic business rules                      | [Workflows](workflows.md): registration eligibility and closure, marks/review states, publication, weighted GPA/CGPA, reporting, and printing                                                  |
| UI and project design                        | [Frontend structure](../frontend/README.md) and [design system](../frontend/docs/design-system.md): shared packages, rendering choices, responsive layouts, accessibility, and recovery states |
| Setup and verification                       | [Development guide](development.md): configuration ownership, Docker/native commands, contract generation, test modes, and operations                                                          |
| Sample data and credentials                  | Seven accounts and six offerings, installed automatically on a fresh demo database; [account list](../README.md#demo-access-and-walkthrough)                                                   |

## Initial sample data

The seed creates a Faculty of Science, a Computing department and undergraduate programme, academic levels, a current first semester, and one assigned lecturer. The session uses the current UTC year or the next available year if that session already exists. Three students have seven course enrollments; Nora starts without registrations. This is synthetic data for exploring the local or hosted demo.

| Course                              | Units | Initial state            | What to explore                                               |
| ----------------------------------- | ----: | ------------------------ | ------------------------------------------------------------- |
| `DEMO101` Introduction to Computing |     3 | Approved; closed roster  | Published result for `student`                                |
| `DEMO102` Programming Fundamentals  |     3 | Submitted; closed roster | HOD approval or correction feedback                           |
| `DEMO103` Discrete Mathematics      |     2 | Pending; open roster     | Lecturer closure, marks, and submission                       |
| `DEMO104` Data and Society          |     2 | Available                | First registration for Nora or an additional eligible student |
| `DEMO105` Web Development           |     3 | Approved; closed roster  | Maya's B and Theo's C in the same course                      |
| `DEMO106` Database Fundamentals     |     2 | Submitted; closed roster | Publication changes Maya's and Theo's statements and averages |

Record IDs are generated during seeding; use the IDs returned by the UI or API. Exploration changes this database. Re-running the seed preserves those changes rather than resetting the tour. For repeatable automated verification, use the [disposable test setup](development.md#verification).

## Walkthrough

### 1. Student records and publication privacy

Sign in to the student portal as `student-maya@demo.example.test` using the example password `12345678`. The overview shows saved registrations, published GPA/CGPA, placement, and profile access. Open Results: `DEMO105` is published with a B and a `4.00 / 5.00` average; `DEMO106` is not visible as a grade until departmental approval. Open the semester statement and its print view.

Use `student-theo@demo.example.test` to see a separate student's C and `3.00 / 5.00`. Both share course offerings, while every student route derives identity from the session. Draft and submitted marks are excluded by the API, not merely hidden by the page.

### 2. Course registration

Sign in as `student-nora@demo.example.test`. Open Course registration, select eligible `DEMO104`, review the units, and confirm. Open the saved semester and Print registration summary. The API rejects duplicate registrations, excessive unit totals, incompatible placement, and closed rosters.

Signup also works for a new account. Placement is optional at signup, but a student needs valid placement before registering. An account with no current department needs a university-wide placement grant for its first assignment. Department-scoped staff can update placement only when both the student's current and destination departments are within their access.

### 3. Lecturer marks and submission

Sign in to the staff portal as `lecturer@demo.example.test`. Open My teaching and `DEMO103`. Inspect the class list, close registration, and enter CA/exam marks within the displayed limits. Save a draft, then submit once all entries are complete. The group becomes Awaiting review and marks are locked.

Before saving, edit a mark and try another route or sign-out to inspect the unsaved-work protection. Cancel the departure to retain the draft. After a successful save, navigation proceeds without a stale warning. The lecturer account has no department review access by default.

### 4. Department review and publication

Sign in as `hod@demo.example.test`. Open Result review for Demo Computing. Approve `DEMO106`, or return a submitted group with feedback and correct/resubmit it as the lecturer. After approval, sign back in as Maya: the second result appears and her weighted GPA/CGPA changes to `4.40 / 5.00`.

An authorized reopening withdraws publication immediately while preserving entered marks and keeping registration closed. Resubmission and approval publish the results again. The [state model](workflows.md#marks-review-and-publication) documents each transition and required privilege.

### 5. Department and university administration

The HOD can manage their department's programmes, curricula, offerings, student placement, delegated registration, and lecturer provisioning. Compare this with `super-admin@demo.example.test`, which also has university setup, role definitions, grants, account lifecycle controls, reporting, and audit access.

Create a custom report-only role and assign it to a staff account if exploring delegation. Its navigation and dashboard contain only permitted workspaces. Department scope belongs to each grant; role names alone do not confer access. The [security guide](security.md) supplies examples of same-department, cross-department, and university-wide decisions.

### 6. Reports and audit

Select a semester and authorized department in Reports. Compare enrollment counts, result states, and published performance before/after approval or reopening. Report averages exclude unpublished marks. Inspect an administrative event in the university Audit trail; safe IDs, state changes, timestamps, and request correlation explain what happened without exposing credentials or raw request bodies.

## Verification evidence

| Verification area                 | Coverage and source                                                                                                                                                                                                                                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API types and unit checks         | Configuration/readiness, privilege scope, audit allowlists, and mutation registration; [backend tests](../backend/test/)                                                                                                                                                                                          |
| Real PostgreSQL/Redis integration | Account lifecycle, validation/Swagger contracts, delegation, concurrent enrollment/closure, mark bounds, corrections, concurrent approval, audit rollback, publication withdrawal, weighted/repeated-course GPA, redaction, and concurrent seed idempotence; [integration fixtures](../backend/test/integration/) |
| Frontend quality and builds       | Formatting, lint, strict types, shared transport/session and privilege tests, and production builds for both apps; [workspace commands](../frontend/package.json)                                                                                                                                                 |
| Real-backend browser workflows    | Student signup/registration/results, lecturer/HOD/Super Admin flows, grant denials, reports/audit, unsaved marks, recovery, sessions, and print views; [Playwright suites](../frontend/e2e/)                                                                                                                      |
| Responsive/accessibility checks   | 320, 390, 768, 1024, and 1440 CSS-pixel widths; light/dark themes; keyboard/modal behavior; automated WCAG scans and saved screenshots for visual review                                                                                                                                                          |
| Container and expiry modes        | Readiness, staff nested-route fallback and asset caching in production-container mode; real 61-second access/75-second refresh expiry in the explicit expiry fixture                                                                                                                                              |

Commands and fixture isolation are in [development and verification](development.md#verification). Ordinary backend unit tests do not execute live integration: `UEMP_RUN_INTEGRATION=1` is required. Browser suites also distinguish development injection, built-container delivery, and opt-in real expiry. Automated scans and source coverage support review; they do not establish universal browser, assistive-technology, load, or production-infrastructure coverage.

## Operational scope

The local Compose stack provides a demo with persistent PostgreSQL data and backend-only Redis. Public hosting, TLS termination, production backups, external telemetry infrastructure, a demonstration recording, and third-party integrations are not provisioned by the local startup command. The hosted portals linked above are deployed separately; the [Render deployment guide](render-deployment.md) explains their configuration, and the [architecture guide](architecture.md) discusses deployment tradeoffs.
