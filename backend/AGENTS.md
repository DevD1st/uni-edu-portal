# Backend Contributor Guide

This NestJS backend serves the university portal. Follow the approved domain rules in [the schema](../docs/schema-review.md).

## Layout

- `src/main.ts` initializes telemetry before loading the HTTP application. `src/app.module.ts` composes the features.
- `src/core/` owns configuration, PostgreSQL, Redis, logging, request context, and telemetry. It must never import a feature or shared application logic.
- `src/shared/` holds application contracts and HTTP infrastructure used across features. Keep it independent of feature implementations.
- `src/modules/<feature>/` owns its controllers, DTOs, commands, queries, entities, and repositories. Place handlers in purpose-named directories and keep a separate file for each handler.
- Use NodeNext imports with a `.js` suffix. Use `#core`, `#shared`, and `#modules` aliases for cross-boundary imports. Cross-feature orchestration goes through CQRS contracts. A transaction that owns a database invariant can use repositories for the tables involved, and entity declarations can refer to related entities.

## Persistence and access

- Keep PostgreSQL names in snake case and NestJS properties in camel case. Use UUIDv7, timezone-aware timestamps, and named constraints. Store schema changes in timestamped migrations under `src/core/database/migrations/`. Keep synchronization disabled.
- Controllers map validated input to commands and queries. Recheck account status, privileges, and department scope in write handlers. Resolve each privilege against the grant that supplies it. Check the row scope of every populated relation.
- Use DTO classes for HTTP bodies, query fields, path parameters, and response bodies. Document each field with a description and realistic example. Give every validator that can reject input a plain-language message. Use response serialization to expose only fields in the DTO.
- Wrap database mutations with `databaseWrite` or `writeTransaction`. Map PostgreSQL constraints to messages that help callers fix their input. Keep raw driver messages, SQL, and submitted values out of HTTP errors and logs.
- Advance the account auth version when issuing, rotating, or revoking sessions. Treat PostgreSQL as authoritative and Redis as the TTL-backed token registry. Redact PII when deleting an account and retain academic and audit history by internal ID.
- Register every privileged HTTP mutation with a semantic audit action. Audit payloads must use allowlisted keys and exclude personal identifiers, credentials, and raw bodies. Audit rows are append-only.
- Record request outcomes, meaningful domain transitions, denied operations, and infrastructure failures. Log safe internal IDs, action names, status, and correlation IDs. Exclude tokens, secrets, names, email addresses, raw query strings, and database error payloads.
- Development and staging emit structured logs only. Production can additionally export metrics and traces. Explain business rules and non-obvious decisions with short comments in the owning module.

## Checks

Run `npm run typecheck`, `npm run build`, and `npm test` from this directory. Run integration tests against disposable PostgreSQL and Redis services after applying the migrations. Use fixtures with synthetic account details.
