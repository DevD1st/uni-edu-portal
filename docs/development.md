# Development and verification

This guide covers host development, contract generation, and verification modes. Use the [root README](../README.md) for the complete container demo, [Render deployment](render-deployment.md) for the hosted frontend services, [architecture](architecture.md) for component boundaries, [security](security.md) for sessions and grants, and [workflows](workflows.md) for academic rules.

## Prerequisites

The complete Docker demo needs Docker with the Compose plugin. Host development also needs Node.js 24+ and pnpm 12.11.2, pinned in `frontend/package.json`. Install that pnpm version if it is not already available:

```powershell
npm install --global pnpm@12.11.2
```

Keep the frontend pnpm lockfile and backend npm lockfile. Use `pnpm install --frozen-lockfile` in `frontend/` and `npm ci` in `backend/`. Backend CLI commands use the compiled `dist/` tree, so build before migrations, seeding, or administrator bootstrapping.

## Complete Docker demo

From the repository root, on first setup:

```powershell
Copy-Item .env.example .env
docker compose up --build --wait
```

The supplied environment example runs the local demo. Compose reads the root `.env`, starts PostgreSQL and Redis, runs the one-shot migration/seed job, and then starts the API and both portals. The [reviewer guide](reviewer-guide.md) provides sign-in details and a walkthrough. Later startup applies pending migrations and retains the seeded records; changing the seed password does not reset existing accounts.

There is one `docker-compose.yaml`. Its PostgreSQL and Redis services have no host ports and use an internal infrastructure network. They are reachable by the API and initialization job, not by host tools or frontend containers. The student container calls the internal HTTP API; the staff browser calls the public API origin. See the [root README](../README.md) for ports, health checks, startup failures, and data retention.

## Configuration and operations

Compose reads the root `.env` for substitutions and supplies it to the API and initialization job. Backend CLI commands load that same file without replacing explicitly injected terminal variables. There is no second backend environment file. Frontend `.env.local` files are needed only for host development, as described below.

| Root setting                                            | Purpose and local behavior                                                                                                                                                                |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_ENV`                                               | `development` in the supplied demo; supports development, staging, test, and production. The demo initializer rejects production.                                                         |
| `PORT`                                                  | Host API port and native API listener; Compose keeps the container listener on 3000.                                                                                                      |
| `POSTGRES_HOST`, `POSTGRES_PORT`                        | Native database connection; the example uses loopback/5432. Compose overrides these with its private `postgres:5432`.                                                                     |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`     | Dedicated database and credentials. The supplied demo uses database `uemp_demo` and user/password `uemp`. Demo seeding accepts `uemp_demo` or `uemp_test`, optionally followed by `_...`. |
| `REDIS_URL`                                             | Backend registry/rate-limit connection. The native example uses loopback/6379; Compose supplies private `redis://redis:6379`. No frontend consumes this setting.                          |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`           | Distinct signing keys, each at least 32 characters. Working public demo values are included; use fresh private values outside the local demo.                                             |
| `ACCESS_TOKEN_TTL_SECONDS`, `REFRESH_TOKEN_TTL_SECONDS` | Default access lifetime 900 seconds and refresh lifetime 604800 seconds; refresh must outlive access.                                                                                     |
| `DEMO_SEED_PASSWORD`                                    | Initial password for freshly created demo accounts: `12345678`. Minimum 7 characters, maximum 72 UTF-8 bytes. Re-seeding does not reset existing passwords.                               |
| `CORS_ORIGINS`                                          | Comma-separated browser origin allowlist, including scheme and port. Align it with portal addresses when changing them.                                                                   |
| `STUDENT_PORT`, `ADMIN_PORT`                            | Compose's public portal ports, defaulting to 3001 and 3002.                                                                                                                               |
| `PUBLIC_API_URL`                                        | Browser-reachable API origin compiled into the staff app as `VITE_API_URL`; empty uses `http://localhost:<PORT>`. Rebuild the staff image after changing it.                              |
| `STUDENT_APP_ORIGIN`                                    | Canonical student browser origin for mutation checks and HTTPS cookies. Compose defaults to the published student port when empty.                                                        |
| `SWAGGER_USER`, `SWAGGER_PASSWORD`                      | Both enable protected Swagger outside production. The local example uses `uemp` / `uemp`; these are documentation credentials, not a portal account.                                      |
| `OTEL_EXPORTER_OTLP_ENDPOINT`                           | Optional production trace/metric collector. Development and staging remain logs-only.                                                                                                     |
| `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`     | Used only by manual `admin:bootstrap`, not automatic demo startup. Bootstrap requires a password of at least 12 characters; configure that before using the separate bootstrap path.      |

Optional `POSTGRES_POOL_MAX` defaults to 10 and is bounded to 1–100. It is a backend tuning/test setting, not a frontend variable. [Session/security details](security.md) explain which values are public origins and which must remain server-side.

Use `docker compose ps -a` to inspect readiness and `docker compose logs --tail 100 migrate backend student admin` for startup diagnostics. A successful initializer exits with code zero. API readiness probes PostgreSQL and Redis; student readiness probes the API; staff readiness checks the static server. Render instead probes the student's independent `/health/live` route so an API cold start does not cause frontend restarts; see the [deployment health checks](render-deployment.md#service-settings-and-environment-variables). `docker compose down` retains the named database volume. `restart` reuses existing images/settings; use `up --build --wait` after a change.

| Symptom                                         | Resolution                                                                                                                                                                                                                         |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Required environment value is missing           | Copy the root example on initial setup and run Compose from the repository root. Keep previously configured values when updating an existing checkout.                                                                             |
| A published port is occupied                    | Stop the conflicting local service or change the published ports, browser origins and CORS settings together.                                                                                                                      |
| Initialization exits unsuccessfully             | Read `migrate` logs, correct the connection/configuration or migration error, and rerun `up`. Temporary database readiness errors are retried for up to 60 seconds.                                                                |
| Database credentials fail on an existing volume | PostgreSQL's initialization variables create credentials only on a fresh volume. Use the existing database credentials or change them through PostgreSQL administration; changing `.env` alone does not change stored credentials. |
| The seed password changed but sign-in did not   | Existing passwords are intentionally preserved. Use the current account password or the application's password-change flow.                                                                                                        |
| Staff assets load but API requests fail         | `PUBLIC_API_URL` must be reachable by the browser. A Compose-only hostname such as `backend` is appropriate for Next's server API address, not the staff browser. Check CORS and rebuild after changing that public address.       |
| Student writes return an origin denial          | Match `STUDENT_APP_ORIGIN` to the browser's exact scheme, host and port.                                                                                                                                                           |

## Host development

The recommended frontend editing setup keeps the API in Docker. From the repository root:

```powershell
docker compose up --build --wait backend
```

If the complete demo is already running, stop its two portal containers before using their ports for hot reload:

```powershell
docker compose stop student admin
```

On first frontend setup, copy each application's example into the filename its development server loads. From `frontend/`:

```powershell
Copy-Item apps/student/.env.example apps/student/.env.local
Copy-Item apps/admin/.env.example apps/admin/.env.local
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3001](http://localhost:3001) for students and [localhost:3002](http://localhost:3002) for staff. `pnpm dev` uses Turborepo to start the Next.js and Vite development servers. The signed-in staff gallery is `/design-system`. Run the copy commands only for initial setup so existing local settings are preserved.

| Host frontend variable | Consumer and purpose                                                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `STUDENT_API_URL`      | Next.js server-only API origin; the host example uses `http://localhost:3000`. Compose supplies `http://backend:3000` at runtime instead. |
| `STUDENT_APP_ORIGIN`   | Canonical public student origin for mutation checks and HTTPS cookie settings; the host example uses `http://localhost:3001`.             |
| `VITE_API_URL`         | Public API origin used by the staff browser. It is embedded in a production build, so rebuild after changing it.                          |

Compose's `PUBLIC_API_URL` supplies the staff `VITE_API_URL` build argument. The root environment file holds backend settings; frontend `.env.local` files are ignored and excluded from images. Keep `CORS_ORIGINS` aligned with the browser origins when changing ports or hostnames. Session behavior and the distinction between public origins and secrets are covered in [security](security.md).

### Native API development

A host NestJS process requires independently provisioned, host-reachable PostgreSQL 17 and Redis 7.4. The private services in the normal Compose stack cannot supply those connections. One local option is to run separate development services with explicit loopback ports:

```powershell
docker run --detach --name uemp-host-postgres --publish 127.0.0.1:5432:5432 --env POSTGRES_DB=uemp_demo --env POSTGRES_USER=uemp --env POSTGRES_PASSWORD=uemp --volume uemp-host-postgres-data:/var/lib/postgresql/data postgres:17
docker run --detach --name uemp-host-redis --publish 127.0.0.1:6379:6379 redis:7.4-alpine
docker exec uemp-host-postgres pg_isready -U uemp -d uemp_demo
docker exec uemp-host-redis redis-cli ping
```

Wait for successful PostgreSQL readiness and `PONG` before running database commands. These services match the host connection values in the supplied root `.env.example`; configure that file for your own services if you use another setup. Stop the Compose API first if port 3000 is already occupied: `docker compose stop backend`.

From `backend/`, initialize a fresh demo database and start Nest with hot reload:

```powershell
npm ci
npm run build
npm run migration:run
npm run demo:seed
npm run start:dev
```

Backend commands load the shared root `.env` regardless of their working directory, while explicit terminal variables take precedence. Demo seeding is limited to non-production databases named `uemp_demo` or `uemp_test`, optionally followed by a suffix. It installs sample accounts and academic records once and preserves existing seeded data.

For an empty installation without sample data, omit `demo:seed` and run `npm run admin:bootstrap` after migrations. Configure `BOOTSTRAP_ADMIN_EMAIL` and a `BOOTSTRAP_ADMIN_PASSWORD` of at least 12 characters for that command; the demo password has its own seven-character minimum. Bootstrap creates the initial active Super Admin only when none already exists. See [backend configuration](../backend/README.md) and [database management](database.md) for the underlying setup.

## Contract generation

Backend DTOs and Swagger define the consumed request/response types. After changing a consumed endpoint or DTO, regenerate from the running API. From `frontend/`, using the Swagger credentials configured in the root environment:

```powershell
$env:UEMP_API_ORIGIN = "http://localhost:3000"
$env:UEMP_SWAGGER_USER = "<configured Swagger user>"
$env:UEMP_SWAGGER_PASSWORD = "<configured Swagger password>"
pnpm contracts:generate
```

Both Swagger settings must be configured to enable `/docs` and `/docs-json` outside production. The generator selects the operations consumed by the portals and their referenced schemas. As an offline alternative, set `UEMP_OPENAPI_FILE` to the absolute path of a Swagger JSON export; that file takes precedence over an API request.

Commit `packages/api-contracts/src/generated.ts` and `generated-response-schemas.json` together. The first supplies DTO types; the second supplies structural validation rules. Preserve and update handwritten readers when a feature has additional runtime invariants. Do not hand-edit generated output or put credentials in the API URL. Clear generation-only terminal variables when they are no longer needed.

## Verification

Source checks and browser tests are separate. Source checks do not prove a workflow against live persistence; browser and backend integration tests create and change records. Use disposable test infrastructure. Test accounts, roster closure, marks, grants, and seed markers can affect a later run's starting state.

| Check                        | Command and requirements                                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend types and unit tests | From `backend/`: `npm run typecheck`, then `npm test`. The test command also builds the API.                                                         |
| Frontend source and builds   | From `frontend/`: `pnpm check` runs formatting, ESLint, strict types, unit tests, and both production builds.                                        |
| Backend integration          | `npm run test:integration` with an explicitly enabled disposable PostgreSQL/Redis setup; see below.                                                  |
| Development browser suite    | `pnpm test:e2e` starts or reuses the two development servers and exercises real backend workflows, including Vite-only rendering-failure injection.  |
| Production browser suite     | Existing container URLs with `UEMP_E2E_EXTERNAL=1` and `UEMP_E2E_PRODUCTION=1`; adds delivery/readiness checks and skips development-only injection. |
| Live token expiry            | Opt-in `e2e/session-expiry.spec.ts` with short-lived tokens; separate from ordinary browser runs.                                                    |

### Backend integration

Provision a disposable PostgreSQL database whose name begins with `uemp_test` and an isolated Redis database. The native services above can supply a local test setup; for example, create an additional database with `docker exec uemp-host-postgres createdb -U uemp uemp_test_local`. From `backend/`, set explicit test values in a dedicated terminal:

```powershell
$env:APP_ENV = "test"
$env:POSTGRES_DB = "uemp_test_local"
$env:REDIS_URL = "redis://127.0.0.1:6379/1"
$env:UEMP_RUN_INTEGRATION = "1"
npm run test:integration
```

Keep the remaining connection settings and different token-signing secrets configured for those test services. The suite applies migrations and creates synthetic fixtures. Without `UEMP_RUN_INTEGRATION=1`, its integration case is skipped. The test database guard is specific to integration safety; it is not a naming restriction on ordinary application databases. Use a separate terminal so test overrides do not carry into normal startup.

### Browser test setup

Install a browser once from `frontend/`:

```powershell
pnpm exec playwright install chromium
```

Set `UEMP_E2E_PASSWORD` in the test terminal to the password used when seeding its demo accounts. An installed Chrome can be selected with `UEMP_PLAYWRIGHT_CHANNEL=chrome`. Tests use one worker because workflows share the disposable demo fixtures.

| Variable              | Browser-test meaning                                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `STUDENT_API_URL`     | Test runner's browser-accessible API origin, default `http://localhost:3000`. This is independent of a student container's private API setting. |
| `UEMP_STUDENT_ORIGIN` | Student portal under test, default `http://localhost:3001`.                                                                                     |
| `UEMP_ADMIN_ORIGIN`   | Staff portal under test, default `http://localhost:3002`.                                                                                       |
| `UEMP_E2E_EXTERNAL`   | `1` prevents Playwright from starting development servers; use it for already running containers or servers.                                    |
| `UEMP_E2E_PRODUCTION` | `1` enables container-delivery checks and skips tests that inject Vite source modules.                                                          |

For a development-server run, start a freshly initialized disposable API using the single Compose file. A separate project and API port keep it distinct from the ordinary demo. From the repository root in a test terminal:

```powershell
$env:PORT = "3100"
$env:POSTGRES_DB = "uemp_test_browser"
$env:CORS_ORIGINS = "http://localhost:3001,http://localhost:3002"
docker compose --project-name uemp-e2e-dev up --build --wait backend
Set-Location frontend
$env:STUDENT_API_URL = "http://localhost:3100"
$env:VITE_API_URL = "http://localhost:3100"
$env:UEMP_E2E_PASSWORD = "<password used by this demo seed>"
pnpm test:e2e
```

Keep ports 3001 and 3002 free for the development servers. Start this mode without `UEMP_E2E_EXTERNAL` or `UEMP_E2E_PRODUCTION` set. The browser suite covers signup, placement, registration, marks/review/publication, authorization, multi-tab sessions, print views, responsive layouts, error recovery, and unsaved-work protection. Focus a relevant existing case while iterating, for example `pnpm test:e2e e2e/printing.spec.ts`.

For production delivery, use a fresh full-stack test project with separate public ports. From the repository root in another test terminal:

```powershell
$env:PORT = "3100"
$env:STUDENT_PORT = "3101"
$env:ADMIN_PORT = "3102"
$env:POSTGRES_DB = "uemp_test_browser"
$env:CORS_ORIGINS = "http://localhost:3101,http://localhost:3102"
docker compose --project-name uemp-e2e-production up --build --wait
Set-Location frontend
$env:STUDENT_API_URL = "http://localhost:3100"
$env:UEMP_STUDENT_ORIGIN = "http://localhost:3101"
$env:UEMP_ADMIN_ORIGIN = "http://localhost:3102"
$env:UEMP_E2E_PASSWORD = "<password used by this demo seed>"
$env:UEMP_E2E_EXTERNAL = "1"
$env:UEMP_E2E_PRODUCTION = "1"
pnpm test:e2e
```

Stop another test API before reusing port 3100. Align any explicit `PUBLIC_API_URL` and `STUDENT_APP_ORIGIN` overrides with the test ports before building. Container delivery checks include readiness, direct SPA routes, asset caching, icons, and the bundled font license. The two controlled rendering-failure tests need the Vite module server and are skipped in this mode; the delivery test is skipped in development mode. Use a new terminal or clear both mode variables before switching back.

### Live expiry and cleanup

The normal session suites simulate or invalidate credentials to check renewal, revocation, and races without long waits. To verify elapsed lifetimes, start a separate disposable API with `ACCESS_TOKEN_TTL_SECONDS=61` and `REFRESH_TOKEN_TTL_SECONDS=75`, point both portals at it, and set `UEMP_E2E_LIVE_EXPIRY=1`. From `frontend/`, run:

```powershell
pnpm test:e2e e2e/session-expiry.spec.ts
```

Only that fixture needs the short lifetimes. It waits for access expiry and then refresh expiry in both applications. Restore normal token settings and clear the opt-in flag afterwards.

From the repository root, stop a test stack using its exact project name, such as `docker compose --project-name uemp-e2e-dev down`. This retains its database. A new browser run needs fresh fixtures; deliberately use a new test project/volume, or reset only that disposable project's data with `down --volumes`. Keep browser reports, traces, screenshots, build output, and local environment files out of commits. Review the [design-system rubric](../frontend/docs/design-system.md#review-questions) alongside automated checks.

## Documentation diagrams

Editable [Mermaid sources](diagrams/) sit beside the SVGs used by the README and guides. SVGs make the diagrams readable without a Markdown extension, and the full ERD can be opened separately for zooming. Keep a source and its rendered image together when the schema or architecture changes.

For example, with the [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli) installed, run `mmdc -c docs/diagrams/mermaid-config.json -i docs/diagrams/architecture.mmd -o docs/diagrams/architecture.svg` from the repository root. The shared [render configuration](diagrams/mermaid-config.json) keeps standalone labels readable. The ERD uses [Mermaid relationship notation](https://mermaid.js.org/syntax/entityRelationshipDiagram.html); database constraints and the documented property dictionary remain the schema authority.
