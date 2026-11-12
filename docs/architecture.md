# Architecture

UEMP has a Next.js student portal, a React staff portal and one NestJS API. The API owns accounts, permissions, academic setup, registration, marks, result review and reporting. PostgreSQL is the authoritative store for both academic records and account revocation. Redis holds expiring token-family records and authentication rate counters.

The backend is a modular monolith. Commands, queries and events run within the same Node.js process, and commands and queries use the same PostgreSQL database. This keeps registration and publication in ordinary database transactions while giving each feature an explicit application interface.

See the [project overview](../README.md), [database guide](database.md), [workflows](workflows.md) and [security guide](security.md) for the related runtime, persistence, business-rule and access details.

## Runtime topology

```mermaid
flowchart TB
  subgraph clients[Browser clients]
    student[Student browser]
    staff[Staff browser]
  end
  subgraph application[Application network]
    next[Next.js student portal<br/>Server-rendered pages and route handlers]
    nginx[Nginx staff portal<br/>React application assets]
    api[NestJS API<br/>Modules, CQRS, validation and authorization]
  end
  subgraph infrastructure[Internal infrastructure network]
    pg[(PostgreSQL<br/>Academic records and auth versions)]
    redis[(Redis<br/>TTL token registry)]
    init[One-shot initializer<br/>Migrations, then demo seed]
  end
  student -->|Pages and HTTP-only cookies| next
  staff -->|Load static assets| nginx
  staff -->|Bearer-authenticated JSON requests| api
  next -->|Server-side authenticated requests| api
  api -->|Transactions and scoped reads| pg
  api -->|Atomic token rotation| redis
  init -->|Apply pending migrations and seed if absent| pg
  init -. Successful completion gates API startup .-> api
  classDef client fill:#eff6ff,stroke:#42658a,color:#142b43
  classDef app fill:#e8f7f3,stroke:#287d6a,color:#123f36
  classDef store fill:#fff7e6,stroke:#9c782c,color:#4b3917
  class student,staff client
  class next,nginx,api app
  class pg,redis,init store
```

[Editable Mermaid source](diagrams/architecture.mmd)

This diagram shows the local Compose networks. Hosted frontends reach the separately deployed API over HTTPS. The fenced diagrams use GitHub's native Mermaid renderer; the `.mmd` files are the editable sources.

## Runtime and technology choices

| Part                     | Implementation and purpose                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API                      | NestJS 11 on the Express adapter, with URI-versioned JSON routes under `/v1`. Liveness and readiness remain unversioned.                                            |
| Language                 | Strict TypeScript, NodeNext modules and explicit `.js` import suffixes. The package supports Node.js 22 or newer; the Docker image uses Node.js 24.                 |
| Application dispatch     | Nest CQRS command/query buses separate write operations from read projections and provide a common instrumentation boundary.                                        |
| Persistence              | TypeORM 0.3 with PostgreSQL 17, explicit migrations and `synchronize: false`. Relations, uniqueness checks and triggers enforce invariants beyond HTTP validation.  |
| Short-lived coordination | Redis 7.4 and ioredis provide atomic refresh claims, token-family updates and authentication rate counters.                                                         |
| HTTP contracts           | DTO classes, class-validator, class-transformer and generated Swagger/OpenAPI documentation. The same response DTO controls serialization and the published schema. |
| Operations               | Winston structured logs, request correlation, dependency health checks and optional production OpenTelemetry metrics/traces.                                        |

## Frontend choices

The staff portal uses React/Vite for its private, client-rendered workspaces. Roster editing, filters, pagination and unsaved-mark navigation are interactive stateful operations; they do not require search-engine indexing. The browser calls Nest with bearer credentials, while the API remains responsible for every permission and publication check. Client-side route guards improve navigation but do not replace that authorization.

The student portal uses the Next.js App Router for server-rendered academic pages, streaming summaries and same-origin route handlers. Those handlers keep authentication cookies HTTP-only, and server components fetch protected records without exposing tokens in browser props. Next.js also leaves room for future public information pages with server-rendered HTML and route metadata. That is a framework capability, not current public indexing: [the root layout](../frontend/apps/student/src/app/layout.tsx) sets `robots: { index: false, follow: false }` for the portal today. Neither frontend connects to PostgreSQL or Redis.

Nginx serves the staff build in the supplied Docker image. It gives Compose and Render the same small static runtime, nested-route fallback and explicit asset-cache rules, without running the Vite development server. Nginx is a deployment choice, not a React requirement: a managed static host can serve the same build if it supplies equivalent routing and cache configuration. The student application needs its Node.js server because it uses server components, cookies and route handlers; it is not a static export.

## Source boundaries

Nest modules declare the controllers and providers that compose each feature. Constructor injection supplies services, buses, database access and logging; the application root wires these modules together. This makes dependencies explicit and keeps infrastructure configuration out of HTTP controllers. Nest's modules and injection container provide the mechanism; domain ownership and transaction rules determine the actual boundaries.

| Location              | Responsibility                                                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/src/core`    | Environment loading, database configuration/migrations, Redis lifecycle, logging, telemetry and health checks. Infrastructure does not import feature implementations. |
| `backend/src/shared`  | Cross-feature commands/queries/events, account and privilege contracts, guards, public error handling, DTO serialization and common HTTP helpers.                      |
| `backend/src/modules` | Feature controllers, DTOs, command/query handlers, services, repositories and entities.                                                                                |
| `backend/src/demo`    | Repeatable synthetic accounts and academic fixtures for the local demonstration.                                                                                       |
| `backend/test`        | Node test suites and opt-in integration fixtures.                                                                                                                      |

Feature ownership follows the domain:

| Module               | Owns                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `auth`               | Sign-in, token issuance/rotation, registry access, sign-out, rate limiting and post-commit token cleanup.                                        |
| `user`               | Account/profile lifecycle, student placement, matriculation issuance and redaction.                                                              |
| `student`            | Student and matriculation entities.                                                                                                              |
| `admin`              | Staff profiles, roles, scoped grants, delegation and administrator audit history.                                                                |
| `academic-reference` | Faculties, departments, programmes, levels, academic sessions, semesters and active public signup choices.                                       |
| `course`             | Shared catalogue courses, programme curriculum links, department offerings and lecturer assignment.                                              |
| `registration`       | Student term snapshots, eligibility, enrollment, teaching rosters and permanent roster closure.                                                  |
| `grading`            | Versioned grading policy and grade-band entities. The initial policy is installed by migrations; there is no grading-policy management HTTP API. |
| `results`            | Draft marks, submission, correction requests, approval, reopening and published student statements/GPA.                                          |
| `reporting`          | Authorized department/university academic aggregates and course performance reports.                                                             |

### Domain-driven ownership

The domain model distinguishes concepts that have different responsibilities: a shared `Course` is not its departmental `CourseOffering`; live student placement is not a saved semester snapshot; and a `ResultGroup` owns roster closure and publication state rather than being a loose collection of marks. These distinctions guide the feature modules and their language.

The [Student module](../backend/src/modules/student/student.module.ts) declares student and matriculation records, while the User module manages their lifecycle. [Registration](../backend/src/modules/registration/registration.module.ts) owns eligibility, term snapshots, enrollment and closure; [Results](../backend/src/modules/results/results.module.ts) owns marks, review and publication. For example, registration can create an offering's result group and enrollment in the same transaction, while result approval locks that group and awards its enrollments. Ownership is a code and policy boundary, not a separate database per module.

Domain policy lives in application services, TypeORM entities and database constraints. The modules are in-process ownership boundaries within one deployment and database. Cross-feature behavior uses shared contracts where appropriate, and an operation that owns a relational invariant uses one transaction manager across the affected tables. Each academic fact has one stored source of truth rather than a duplicate datastore per module.

### CQRS application interfaces

Controllers map HTTP DTOs to intent-specific messages. A registration request dispatches `RegisterCoursesCommand` through [its handler](../backend/src/modules/registration/commands/handlers/register-courses/register-courses.handler.ts) into `RegistrationService.register`; approval dispatches `ApproveResultsCommand` into `ResultWorkflowService.approve`. Queries return scoped DTO projections such as available courses or a student's approved statement. This separates reads from writes at the application interface while keeping one PostgreSQL store.

CQRS makes these workflows explicit and gives [bus instrumentation](../backend/src/core/telemetry/cqrs-telemetry.service.ts) one place to record execution duration and outcome. It adds message/handler boilerplate, and it does not by itself establish domain-driven design, create a read replica or imply event sourcing. The domain vocabulary, ownership and invariants described above are separate decisions.

## Request lifecycle

1. Startup loads the root `.env` without replacing values already supplied by the process or container. Telemetry is initialized before importing the HTTP application.
2. HTTP middleware generates a request ID, establishes request context, applies security headers and records the eventual response outcome. Configured CORS origins are exact allowed browser origins.
3. Protected routes validate the bearer token, active account, account auth version and registered token family. Staff routes additionally check administrator access and any declared capability. Resource-level department and assignment checks happen in the service using the validated request.
4. The global validation pipe transforms DTO inputs, rejects unknown fields and returns explicit validation messages. The controller dispatches a command or query.
5. The service reads an authorized projection or completes a transaction. Response DTO serialization exposes the documented field allowlist. A global exception filter maps expected failures to useful public messages and masks unexpected internal errors.

Protected responses and token-bearing responses use `Cache-Control: no-store`. Profile reads resolve a student's assigned placement labels even after a reference is deactivated; the public signup lookup continues to return active choices only.

The main entry points are [bootstrap](../backend/src/bootstrap.ts), [access authentication](../backend/src/shared/auth/access-token.guard.ts), [staff authorization](../backend/src/shared/admin-authorization/admin-privilege.guard.ts) and [response serialization](../backend/src/shared/http/api-dto-response.decorator.ts).

## Transactions and consistent reads

Registration locks the student account before selecting or creating the term snapshot. It locks selected offerings in ID order, then their result groups, before checking eligibility, duplicate courses, credit limits and roster closure. Offering reassignment, roster closure and result changes use the same offering-before-group order. Concurrent writers therefore serialize around the academic records they can change.

Marks, state transitions, grade awards and their successful audit events commit together. Approval requires complete marks on a submitted group and awards bands from the offering's pinned policy. An approver cannot approve their own work: being the assigned lecturer, latest submitter or a recorded successful marks contributor makes it their own work, including after reassignment. The sole self-approval exception is a protected `super_admin` system role assigned university-wide, together with the normal approval privilege; an HOD grant or a role merely named Super Admin does not qualify. Reopening clears current awards and withdraws student publication in the same transaction; it never reopens registration. PostgreSQL triggers also reject invalid transitions, changes to locked marks, inconsistent enrollments and changes to retained academic identity.

Directories, multi-query summaries, review views and statements use repeatable-read snapshots where their result must remain consistent across queries. GPA/CGPA queries include only currently approved awards and keep PostgreSQL numeric precision until final rounding. A read model is SQL/DTO projection, not a separately replicated store.

Database writes use `databaseWrite` or `writeTransaction`, including commit-time constraint failures. Conflicts and invalid references become public conflict/input messages rather than raw SQL or driver details. See [database constraints](database.md) and [workflow transitions](workflows.md) for the complete rules.

## Events and the account cleanup saga

There is one actual Nest `@Saga()`: [AccountAuthSaga](../backend/src/modules/auth/sagas/account-auth.saga.ts). For example, a password change, suspension, explicit session revocation or account deletion first commits its new `authVersion` in [UserAdministrationService](../backend/src/modules/user/services/user-administration.service.ts). The service then publishes `AccountAuthChangedEvent`; the saga maps it to `ClearRevokedSessionCommand`, and [the command handler](../backend/src/modules/auth/commands/handlers/clear-revoked-session/clear-revoked-session.handler.ts) calls `TokenRegistryService` to remove older Redis families. Sign-in and refresh have their own synchronous token-registry flow; this saga is the account-lifecycle cleanup example.

```mermaid
sequenceDiagram
    participant U as UserAdministrationService
    participant P as PostgreSQL
    participant E as In-process EventBus
    participant S as AccountAuthSaga
    participant C as CommandBus
    participant H as ClearRevokedSessionHandler
    participant R as Redis
    U->>P: Commit account change and advance authVersion
    P-->>U: Committed
    U->>E: Publish AccountAuthChangedEvent
    E->>S: Deliver event
    S->>C: ClearRevokedSessionCommand
    C->>H: Execute cleanup command
    H->>R: TokenRegistryService removes older families
    Note over P,R: PostgreSQL already rejects the revoked version
```

[Editable Mermaid source](diagrams/account-session-saga.mmd)

This is local event-to-command orchestration. It has no durable message broker, outbox, replay log or compensating distributed transaction. PostgreSQL version checks already reject revoked tokens even if the process stops before Redis cleanup; expired registry entries also have TTLs. A delayed cleanup uses the event's version and cannot delete a newer sign-in. Asynchronous handler failures are logged through the CQRS exception bus.

CQRS is used for explicit ownership and consistent instrumentation, rather than event sourcing. Administrator audit rows are retained evidence; application state is stored in the normal relational tables and is not reconstructed from audit events.

## Audit and observability

Administrator HTTP mutations declare semantic audit actions. The guard records recognized privilege denials; the interceptor records other denied, failed or successful attempts. Result changes, roster closure and offering reassignment write success events inside their owning transaction. Their interceptor metadata prevents duplicate success events. Other mutation audits occur separately after the operation; an audit persistence failure is logged without misreporting an already committed mutation as rolled back.

Logs contain safe action/type names, internal IDs, duration, outcome and correlation IDs. They omit request bodies, credentials, raw query strings and personal identifiers. Request IDs are generated at the API boundary and returned as `x-request-id`; an active trace adds `x-trace-id`.

Command/query execution is wrapped once to record duration, message type and outcome. Development, staging and test use structured logs without telemetry exporters. In production, `OTEL_EXPORTER_OTLP_ENDPOINT` enables the OpenTelemetry SDK for metrics/traces. File-system and Redis auto-instrumentation are disabled and enhanced PostgreSQL reporting is off. The repository does not include a collector or observability dashboard.

## Startup, deployment and limits

The single root Compose definition starts PostgreSQL, Redis, a one-shot initialization job, the API and both portals. The initialization job waits for a usable PostgreSQL connection, applies pending migrations, then runs the transactional demo seed. Durable completion markers and an advisory transaction lock keep repeated/concurrent seed runs from duplicating or resetting data. The HTTP server does not run migrations itself.

The API joins the application and internal infrastructure networks. Portals join only the application network; database/cache services publish no host ports. API and portal host ports bind to loopback in the provided stack. API readiness probes PostgreSQL and Redis. The student server has separate process liveness and API-dependent readiness endpoints; Render uses its process-only liveness so an independently sleeping API cannot restart a healthy frontend. Shutdown closes the Nest application and optional telemetry SDK.

The supplied Compose startup is intended for development and demonstration: its initializer always checks the demo seed, which rejects production and databases outside the demo/test naming convention. A production deployment must run migrations without demo seeding and provide its own deployment configuration, TLS termination, secret management and backup/restore process. [Development](development.md) documents supported local commands and configuration.

The separate [Render Blueprint](../render.yaml) deploys only the two frontend services against the existing hosted API. It selects the student or staff runtime from the shared Dockerfile through a build argument; it does not provision a new backend or database. [Render deployment](render-deployment.md) explains assigned origins, backend CORS, and build-time versus runtime settings.

The design intentionally makes protected access depend on PostgreSQL and Redis. Redis loss ends stored sessions and authentication fails closed while it is unavailable. Post-commit cleanup is not a durable background job, and routine mutation audit delivery outside the transaction is not guaranteed during audit-store failure. These limits are explicit so availability and retention choices can be evaluated independently from the academic transaction guarantees.
