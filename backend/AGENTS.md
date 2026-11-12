# Backend Contributor Guide

This NestJS backend serves the university portal. Follow the domain rules in [the database design](../docs/database.md).

## Layout

- `src/main.ts` initializes telemetry before loading the HTTP application. `src/app.module.ts` composes the features.
- `src/core/config/load-env.ts` loads the repository's root `.env` before configuration is read, independently of the current working directory. Reuse it for HTTP, migrations, initialization, and administrator bootstrap. Keep injected container and shell variables authoritative, and keep Nest's separate environment-file loading disabled.
- Verify plain Compose commands without `--env-file`; the root settings must resolve automatically. Keep the default `uemp-demo` project name stable so existing database volumes are reused. Use an explicit project override only to isolate verification or separate deployments.
- `src/initialize.ts` is the one-shot database initialization entry point. It waits for a usable PostgreSQL connection before running migrations and the existing demo seed. Retry only transient readiness failures within a bounded window; migration or seed failures must exit nonzero so Compose does not start the API against incomplete initialization.
- `src/core/` owns configuration, PostgreSQL, Redis, logging, request context, and telemetry. It must never import a feature or shared application logic.
- `src/shared/` holds application contracts and HTTP infrastructure used across features. Keep it independent of feature implementations.
- `src/modules/<feature>/` owns its controllers, DTOs, commands, queries, entities, and repositories. Place handlers in purpose-named directories and keep a separate file for each handler.
- Use NodeNext imports with a `.js` suffix. Use `#core`, `#shared`, and `#modules` aliases for cross-boundary imports. Cross-feature orchestration goes through CQRS contracts. A transaction that owns a database invariant can use repositories for the tables involved, and entity declarations can refer to related entities.

## Persistence and access

- Keep PostgreSQL names in snake case and NestJS properties in camel case. Use UUIDv7, timezone-aware timestamps, and named constraints. Store schema changes in timestamped migrations under `src/core/database/migrations/`. Keep synchronization disabled.
- Controllers map validated input to commands and queries. Recheck account status, privileges, and department scope in write handlers. Resolve each privilege against the grant that supplies it. Check the row scope of every populated relation.
- The catalog course is university-wide. Curriculum membership belongs to a programme, and an offering, its roster, and its results belong to the offering's department.
- Registration uses the faculty's current active semester and the student's saved placement for that term. Lock the student account before taking the term lock, then lock offerings by ID and their result groups in the same order. Lecturer roster closure takes the offering lock before the result group lock. Keep selection, unit checks, snapshot creation, and enrollment in one transaction. Roster closure is permanent.
- An HOD can provision the seeded Lecturer role in their own department as part of creating a lecturer account. General role grants still require the assigner's role management privileges and delegation scope.
- Use DTO classes for HTTP bodies, query fields, path parameters, and response bodies. Document each field with a description and realistic example. Give every validator that can reject input a plain-language message. Use response serialization to expose only fields in the DTO.
- Wrap database mutations with `databaseWrite` or `writeTransaction`. Map PostgreSQL constraints to messages that help callers fix their input. Keep raw driver messages, SQL, and submitted values out of HTTP errors and logs.
- Advance the account auth version when issuing, rotating, or revoking sessions. Treat PostgreSQL as authoritative and Redis as the TTL-backed token registry. Redact PII when deleting an account and retain academic and audit history by internal ID.
- Keep PostgreSQL and Redis on the internal Compose infrastructure network. Only the API and initialization job join it. Frontend applications manage token transport through cookies or their tab session and must use the HTTP API rather than connecting to this infrastructure.
- Read scoped directories, rosters and multi-query registration summaries in one database snapshot. Protected responses and responses containing session tokens must use `Cache-Control: no-store`.
- Include readable labels for a student's assigned faculty, department, programme and academic level in authorized profile responses, even when those references become inactive. Public signup choices must remain active-only; deactivation must not erase an existing student's placement identity.
- Register every privileged HTTP mutation with a semantic audit action. Audit payloads must use allowlisted keys and exclude personal identifiers, credentials, and raw bodies. Audit rows are append-only.
- Resolve staff result grants and reads using the same database transaction manager. Result writes lock the offering before the result group. Commit marks, state changes, grade awards, and their success audits in the same transaction. Use the pinned grading policy and publish student results only while the group is approved. Keep the [workflow guide](../docs/workflows.md) current when permissions, state transitions, GPA rules, or audit behavior change.
- Block approval by the assigned lecturer, latest submitter or an actual marks contributor, including after reassignment. Only a university-wide grant of the protected `super_admin` system role exempts self-approval; normal approval privilege, department scope and submitted state still apply. Use the same backend eligibility policy for result-detail metadata and the locked approval transaction. Treat only successful audit entries with changed marks as contribution history.
- Reporting reads use one snapshot for grants and data. A missing department requires a university-wide reporting grant. Lecturer roster and result summaries remain tied to offering assignments. Exclude draft marks and student identifiers from aggregate reports.
- Record request outcomes, meaningful domain transitions, denied operations, and infrastructure failures. Log safe internal IDs, action names, status, and correlation IDs. Exclude tokens, secrets, names, email addresses, raw query strings, and database error payloads.
- Development and staging emit structured logs only. Production can additionally export metrics and traces. Explain business rules and non-obvious decisions with short comments in the owning module.

## Checks

Run `npm run typecheck` and `npm test` from this directory. The test command builds the backend. Keep exactly one Compose file at the repository root: `docker-compose.yaml`. Configure the root `.env` from the example, then run `docker compose up --build --wait` and check `/health/ready`. The initialization job applies pending migrations and creates demo data on the first start of a fresh database. On subsequent runs, the seed checks its transactional completion markers and leaves existing data intact. Both initialization steps must succeed before the API starts. Both portals then wait for API readiness. Append `backend` for backend-only development. Keep startup commands and first-start behavior in the top-level README current.

Run `npm run test:integration` with `UEMP_RUN_INTEGRATION=1`, `APP_ENV=test`, and settings for a disposable PostgreSQL database whose name starts with `uemp_test`, plus a disposable Redis instance. Use synthetic account details in fixtures.

Use `npm run demo:seed` only on dedicated non-production demo or test databases. Keep the [reviewer walkthrough](../docs/reviewer-guide.md) current when demo behavior changes.
