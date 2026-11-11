# UEMP frontend

The frontend contains two applications: a Next.js student portal for profile, course registration, academic history, and printed statements; and a React/Vite staff portal for teaching, departmental review, university administration, reports, and audit. Both use the same design system, HTTP transport, and backend DTO contracts.

## Run the demo

From the repository root, copy the supplied local configuration once and start the complete stack:

```powershell
Copy-Item .env.example .env
docker compose up --build --wait
```

| Application    | Local                                   | Hosted                                                                         |
| -------------- | --------------------------------------- | ------------------------------------------------------------------------------ |
| Student portal | [localhost:3001](http://localhost:3001) | [uemp-student.onrender.com/sign-in](https://uemp-student.onrender.com/sign-in) |
| Staff portal   | [localhost:3002](http://localhost:3002) | [uemp-admin.onrender.com/sign-in](https://uemp-admin.onrender.com/sign-in)     |

For local startup, the initialization job applies migrations and seeds a fresh database before either portal starts. Restarts preserve existing accounts and academic records. The [reviewer guide](../docs/reviewer-guide.md) provides demo accounts and a walkthrough; the [root README](../README.md) documents container configuration and operations.

## Deploy on Render

The root [render.yaml](../render.yaml) creates separate student and staff Docker Web Services against the existing hosted API. `FRONTEND_APP=student` or `admin` selects the shared Dockerfile's final runtime; local Compose keeps its named targets. Use the [Render deployment guide](../docs/render-deployment.md) for Blueprint setup, exact service paths and variables, assigned origins, and the existing backend's CORS update.

## Host development

Use Node.js 24+ and the pinned pnpm version in `package.json`. The recommended editing setup keeps the API and its private infrastructure in Docker while running both portals with hot reload. Follow [host development](../docs/development.md#host-development) for commands, environment files, and native API alternatives.

The student app uses `apps/student/.env.local` and the staff app uses `apps/admin/.env.local`, each copied from its own `.env.example`. Those files are for host development; Docker receives its frontend settings explicitly from Compose.

## Application and package boundaries

| Location                                               | Responsibility                                                                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/student`                                         | Next.js App Router, server-side student reads, HTTP-only cookie handlers, registration, published results, and authenticated print routes. |
| `apps/admin`                                           | React/Vite SPA, React Router navigation, tab-owned staff sessions, scoped administration, and interactive marks/review workflows.          |
| `packages/theme`                                       | Self-hosted Source Sans 3, semantic color and spacing tokens, light/dark themes, and Tailwind mappings.                                    |
| `packages/ui`                                          | Accessible controls, navigation shells, forms, dialogs, record tables, feedback, and theme controls.                                       |
| `packages/api-contracts`                               | OpenAPI-generated DTO types and structural response schemas, plus validated readers at API boundaries.                                     |
| `packages/web-client`                                  | HTTP transport, authenticated retries, friendly API errors, and the staff tab-session store.                                               |
| `packages/eslint-config`, `packages/typescript-config` | Shared lint rules and strict TypeScript configuration.                                                                                     |
| `e2e`                                                  | Browser regressions against a real disposable backend, including workflow, scope, session, responsive, and print behavior.                 |

pnpm provides one lockfile and explicit `workspace:*` dependencies. Turborepo orders shared tasks and caches eligible builds. Packages expose their public entry points and never import app internals. A component belongs in a shared package when both applications need the same behavior; domain-specific presentation stays beside its workflow.

The student portal renders academic records on the server and routes browser mutations through same-origin handlers. The staff portal uses a SPA because its tables, filters, dialogs, and marks editor maintain interactive workspace state. This keeps each application's runtime suited to its workflows while sharing visual and API foundations. The cost is maintaining two build pipelines; the workspace coordinates their checks and produces separate deployable images.

Routes compose pages. Product code lives under `src/features/<domain>`: components own presentation and interaction, server/API adapters own data access, and the owning feature supplies status labels and workflow copy. Student server code stays outside browser bundles. Staff route guards and navigation read the same workspace catalogue; controls additionally check the current grant, department, assignment, and record state. Nest remains authoritative for every operation.

## Design and interaction

The [design system](docs/design-system.md) records visual tokens, component decisions, responsive behavior, accessibility expectations, and the page inventory. Source Sans 3 is bundled locally with its license. The shared shell adapts from a mobile drawer to a collapsible desktop sidebar, and both themes use semantic tokens.

Student statements open dedicated authenticated print views in a new tab. They retain identity, saved placement, semester/session, complete course details, and relevant totals while omitting portal controls from paper. Staff marks preserve drafts across roster tabs and protect unsaved changes before navigation or sign-out. Both applications distinguish loading, empty, restricted, error, and successful states.

The signed-in staff design gallery is available at `/design-system` in development and excluded from the production bundle.

## Sessions and API contracts

The student server owns HTTP-only token cookies; the staff application keeps a validated session in each tab's sessionStorage. Both communicate with Nest over HTTP. Session rotation, expiry, multi-tab behavior, revocation, and the authorization model are documented in [security](../docs/security.md).

Request and response types follow backend DTOs. Regenerate contracts after changing consumed endpoints, preserve the handwritten boundary readers, and commit both generated files. See [contract generation](../docs/development.md#contract-generation) for the Swagger and local-file modes.

## Verification

From `frontend/`, `pnpm check` runs formatting, lint, strict types, unit tests, and both production builds. Browser tests are a separate real-backend check and change demo data. The [verification guide](../docs/development.md#verification) explains disposable setup, normal development-server tests, production-container tests, and the opt-in real-expiry fixture.

Follow [AGENTS.md](AGENTS.md) when contributing. The canonical system documentation covers [architecture](../docs/architecture.md), [database design](../docs/database.md), [security](../docs/security.md), and [workflows](../docs/workflows.md).
