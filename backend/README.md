# University Education Management Portal API

This backend slice includes the initial PostgreSQL schema, authentication, student account and placement management, administrator accounts and scoped role grants, academic reference lookups, and administrator audit history. Course, registration, result, and grading entities are in their owning modules. Their workflow endpoints are a subsequent slice.

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
| Admin user management | `/v1/admin/users`, `/v1/admin/users/students`, and individual profile, placement, status, session revocation, and deletion routes |
| Admin and role management | `/v1/admin/admins`, `/v1/admin/roles`, and scoped grant assignment and revocation |
| Audit | `GET /v1/admin/audit-events` and `GET /v1/admin/audit-events/{eventId}` |

Sign-in accepts an email, password, and account role (`student` or `admin`). Use the returned access token as a Bearer token. Refresh rotates both tokens and revokes the previous pair. Add `populate=student` to eligible admin user reads or `populate=roles%20user` to admin directory reads. Each relation is filtered by the caller’s privileges and department scope.

Development and staging emit structured logs with request IDs. In production, setting `OTEL_EXPORTER_OTLP_ENDPOINT` enables OpenTelemetry traces and metrics. The server returns the request ID for log and audit correlation.

## Verify

Run `npm run typecheck` and `npm test`. For the integration suite, set `APP_ENV=test`, `UEMP_RUN_INTEGRATION=1`, a disposable PostgreSQL database with a name beginning with `uemp_test`, Redis connection settings, and test signing secrets. Run `npm run test:integration`. The suite creates synthetic accounts and applies migrations to the disposable database.

See the [schema](../docs/schema-review.md) for the approved workflow and retention rules.
