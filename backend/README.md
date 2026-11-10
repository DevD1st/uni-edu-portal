# University Education Management Portal API

The API supports authentication, account and role management, academic and course setup, student registration, lecturer rosters and marks, departmental result review, and student result statements.

## Run locally

1. Copy `backend/.env.example` to `backend/.env`. Set the database password and two different random signing secrets of at least 32 characters. Set the bootstrap administrator email and password.
2. From the workspace root, run `docker compose --env-file backend/.env up --build -d`. Compose starts PostgreSQL and Redis, applies the migrations, then starts the API.
3. Run `docker compose --env-file backend/.env exec backend npm run admin:bootstrap` to create the first university-wide administrator.
4. Check `GET /health/ready` on the configured port. Set both Swagger credentials in the environment to access `/docs` in development or staging.

For local development with PostgreSQL and Redis already running, run `npm ci`, `npm run build`, `npm run migration:run`, `npm run admin:bootstrap`, and `npm run start:dev` from `backend/`. Use PostgreSQL 17 and Redis 7.4 to match Compose.

## API entry points

| Area | Routes |
| --- | --- |
| Authentication | `POST /v1/auth/signup/student`, `POST /v1/auth/sign-in`, `POST /v1/auth/refresh`, `POST /v1/auth/sign-out` |
| Student or admin self-service | `GET`, `PATCH`, `DELETE /v1/users/me`, and `PATCH /v1/users/me/password` |
| Academic lookup | `GET /v1/academic-references` |
| Academic setup | `GET /v1/admin/academic`, with create and update routes for faculties, departments, programmes, sessions, and semesters. Set a faculty's registration term with `PUT /v1/admin/academic/faculties/{id}/current-semester`. |
| Course setup | `/v1/admin/courses` for the catalog, `/curriculum` for programme links, `/offerings` for departmental deliveries, and `GET /lecturers?departmentId=…` for assignment choices. |
| Student registration | `GET /v1/student/registrations/available`, `POST /v1/student/registrations`, and `GET /v1/student/registrations` for registered semesters. Read or download a semester summary at `/{semesterId}` or `/{semesterId}/summary/download` under the same route. |
| Department registration | `GET /v1/admin/registrations?departmentId=…&semesterId=…` and `POST /v1/admin/registrations/students/{userId}`. |
| Lecturer roster | `GET /v1/lecturer/offerings`, `GET /v1/lecturer/offerings/{offeringId}/roster`, and `POST /v1/lecturer/offerings/{offeringId}/close-registration`. |
| Lecturer results | `GET /v1/lecturer/results`, `GET /v1/lecturer/results/{resultGroupId}`, `PATCH /v1/lecturer/results/{resultGroupId}/marks`, and `POST /v1/lecturer/results/{resultGroupId}/submit`. |
| Department result review | `GET /v1/admin/results?departmentId=…`, `GET /v1/admin/results/{resultGroupId}`, and `POST` to `/approve`, `/request-corrections`, or `/reopen` under the group route. |
| Student results | `GET /v1/student/results`, `GET /v1/student/results/{semesterId}`, and `GET /v1/student/results/{semesterId}/statement/download`. |
| Admin user management | `/v1/admin/users`, `/v1/admin/users/students`, and individual profile, placement, status, session revocation, and deletion routes |
| Admin and role management | `/v1/admin/admins`, `/v1/admin/roles`, and scoped grant assignment and revocation |
| Audit | `GET /v1/admin/audit-events` and `GET /v1/admin/audit-events/{eventId}` |

Sign-in accepts an email, password, and account role (`student` or `admin`). Use the returned access token as a Bearer token. Refresh rotates both tokens and revokes the previous pair. Add `populate=student` to eligible admin user reads or `populate=roles%20user` to admin directory reads. Each relation is filtered by the caller’s privileges and department scope.

To open registration, activate an academic session and semester, select the semester for the faculty, and link catalog courses to each programme. Create offerings for the department and study level, assign lecturers, and activate the offerings. An HOD can provision a lecturer with `POST /v1/admin/admins` using their own `departmentId` and the lecturer's account details. Omitting `roleId` selects the seeded Lecturer role.

Submit `semesterId` and `offeringIds` together. The API confirms the entire selection in one transaction and keeps the student's placement for that semester. The assigned lecturer can close a roster once it has its first enrollment. Closure is permanent.

The assigned lecturer can save marks in batches before or after closing enrollment, then submit when every enrollment has both marks. Departmental approval publishes the grades using the offering's pinned scale. Reviewers can return submitted results with feedback. Authorized reopening records a reason code and removes published grades from student views until reapproval. Students can read semester GPA and CGPA based on approved credit units and download a printable text statement.

The [results workflow guide](../docs/results-workflow.md) documents every results route, required privilege, state transition, grading rule, audit event, and verification step.

Development and staging emit structured logs with request IDs. In production, setting `OTEL_EXPORTER_OTLP_ENDPOINT` enables OpenTelemetry traces and metrics. The server returns the request ID for log and audit correlation.

## Verify

Run `npm run typecheck` and `npm test`. For the integration suite, set `APP_ENV=test`, `UEMP_RUN_INTEGRATION=1`, a disposable PostgreSQL database with a name beginning with `uemp_test`, Redis connection settings, and test signing secrets. Run `npm run test:integration`. The suite creates synthetic accounts and applies migrations to the disposable database.

See the [schema](../docs/schema-review.md) for the approved workflow and retention rules.
