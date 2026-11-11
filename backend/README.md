# UEMP API

NestJS API for accounts, staff permissions, academic setup, course registration, lecturer rosters and marks, departmental review, published student results and reporting.

Start with the [root README](../README.md) for the complete application. Detailed references:

- [Architecture](../docs/architecture.md): modules, request execution, CQRS, the account cleanup saga and operations.
- [Security](../docs/security.md): permissions, session transport/rotation, errors, audit and account redaction.
- [Database](../docs/database.md): schema, relationships, constraints and retention.
- [Workflows](../docs/workflows.md): setup, enrollment, grading, review, publication and GPA rules.
- [Development](../docs/development.md): environment variables, local commands and isolated verification.
- [Reviewer guide](../docs/reviewer-guide.md): demo accounts, walkthrough and handoff evidence.

## Development entry points

From the repository root, the single Compose definition starts the API and its dependencies with:

```sh
docker compose up --build --wait backend
```

Use the copy-ready root configuration and setup instructions in the [project README](../README.md). The one-shot initialization job applies migrations and creates a fresh demo dataset before the API starts. Later starts retain existing records. The provided initializer is for non-production demo/test databases.

For host development, install with `npm ci` in `backend/`, then use these package commands with PostgreSQL/Redis configured as described in [development](../docs/development.md):

| Command                    | Purpose                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run build`            | Compile the API, entities, migrations and CLI entry points into `dist/`.                                 |
| `npm run start:dev`        | Start the Nest development watcher.                                                                      |
| `npm run migration:run`    | Apply pending compiled TypeORM migrations. Build first.                                                  |
| `npm run db:initialize`    | Wait for PostgreSQL, apply migrations and run demo initialization.                                       |
| `npm run demo:seed`        | Add the synthetic demo fixtures when their completion markers are absent. Existing records are retained. |
| `npm run admin:bootstrap`  | Create the initial global Super Admin only if no active one exists.                                      |
| `npm run typecheck`        | Check strict TypeScript types without emitting code.                                                     |
| `npm test`                 | Build and run the Node unit/configuration suites.                                                        |
| `npm run test:integration` | Build and run opt-in API/database integration coverage against disposable infrastructure.                |

HTTP startup does not apply migrations. Never point integration fixtures or demo commands at a real deployment database. Read [backend contributor rules](AGENTS.md) before changing the implementation.

## HTTP contract

JSON routes use the `/v1` prefix. Send `Authorization: Bearer <access-token>` on protected calls. Sign-in accepts `email`, `password` and `role` (`student` or `admin`); renewal rotates both credentials. Staff privileges and department scopes are resolved by the API, not inferred from a role name.

When enabled in a non-production environment, `/docs` provides the complete DTO examples and OpenAPI contract behind the configured HTTP Basic credentials. `/docs-json` and `/docs-yaml` share that protection. `GET /health/live` checks liveness; `GET /health/ready` probes PostgreSQL and Redis.

| Area                    | Routes                                                                                                                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication          | `POST /v1/auth/signup/student`, `POST /v1/auth/sign-in`, `POST /v1/auth/refresh`, `POST /v1/auth/sign-out`                                                                                                                                                                      |
| Own account             | `GET`, `PATCH`, `DELETE /v1/users/me`; `PATCH /v1/users/me/password`                                                                                                                                                                                                            |
| Public signup choices   | `GET /v1/academic-references`                                                                                                                                                                                                                                                   |
| Academic setup          | Base `/v1/admin/academic`: `GET /`; `POST /faculties`, `/departments`, `/programmes`, `/sessions`, `/semesters`; `PUT /faculties/{id}`, `/departments/{id}`, `/programmes/{id}`, `/sessions/{id}`, `/semesters/{id}`, `/levels/{id}/status`, `/faculties/{id}/current-semester` |
| Courses and offerings   | `GET`, `POST /v1/admin/courses`; `PUT /{id}`, `GET /lecturers`, `POST /curriculum`, `DELETE /curriculum/{id}`, `POST /offerings`, `PATCH /offerings/{id}` under that base                                                                                                       |
| Student registration    | `GET`, `POST /v1/student/registrations`; `GET /available` and `GET /{semesterId}` under that base                                                                                                                                                                               |
| Department registration | `GET /v1/admin/registrations`; `GET /students/{userId}/available`, `POST /students/{userId}` under that base                                                                                                                                                                    |
| Lecturer rosters        | `GET /v1/lecturer/offerings`; `GET /{offeringId}/roster`, `POST /{offeringId}/close-registration` under that base                                                                                                                                                               |
| Lecturer results        | `GET /v1/lecturer/results`; `GET /{resultGroupId}`, `PATCH /{resultGroupId}/marks`, `POST /{resultGroupId}/submit` under that base                                                                                                                                              |
| Department review       | Base `/v1/admin/results`: `GET /`, `/options`, `/{resultGroupId}`; `POST /{resultGroupId}/approve`, `/{resultGroupId}/request-corrections`, `/{resultGroupId}/reopen`                                                                                                           |
| Student results         | `GET /v1/student/results` and `GET /v1/student/results/{semesterId}`                                                                                                                                                                                                            |
| Reports                 | `GET /v1/admin/reports/options`, `GET /v1/admin/reports/overview`, `GET /v1/admin/reports/courses`                                                                                                                                                                              |
| User administration     | `GET /v1/admin/users`, `/{userId}`; `POST /students`; `PATCH /{userId}`, `/{userId}/status`; `PUT /{userId}/student-placement`; `POST /{userId}/revoke-sessions`; `DELETE /{userId}` under that base                                                                            |
| Staff and roles         | `/v1/admin/admins` for directory/account creation and role grants; `/v1/admin/roles` for role reads and custom-role management; `GET /v1/admin/admins/me/authorization` for current grants                                                                                      |
| Audit history           | `GET /v1/admin/audit-events` and `GET /v1/admin/audit-events/{eventId}`                                                                                                                                                                                                         |

Directories and rosters use cursor pagination. Supported user population includes `populate=student`; staff directory population includes `populate=roles%20user`. The API filters each populated relation by scope. Reporting requires a semester and, for department-scoped access, the department ID.

The student UI opens authenticated print views for registration summaries and result statements. Text attachment endpoints also remain available at `/v1/student/registrations/{semesterId}/summary/download` and `/v1/student/results/{semesterId}/statement/download`. They use the same authorized summaries and published-only results.

Responses use DTO field allowlists and `Cache-Control: no-store` on protected/token-bearing data. Errors return a public message and request ID; optional field messages and trace IDs support correction and troubleshooting without exposing SQL or credentials.
