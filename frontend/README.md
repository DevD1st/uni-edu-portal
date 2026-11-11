# UEMP web workspace

The student portal runs on Next.js at port 3001. The staff portal runs on React and Vite at port 3002. Both share the theme, component library, API transport, and generated contracts. Read [AGENTS.md](AGENTS.md), the [design system](docs/design-system.md), and the [UI review questions and inventory](docs/ui-review.md) before contributing.

## Complete Docker demo

Configure the root `.env` as described in the [project README](../README.md#start-the-complete-demo). From the repository root, start the API, both portals, migrations, and demo data together:

```powershell
docker compose up --build --wait
```

The student image runs a standalone Next.js server and calls the internal HTTP API for data and authentication. The staff image serves production assets through Nginx, with SPA routing and immutable hashed assets. Its `VITE_API_URL` comes from the public `PUBLIC_API_URL` Compose build argument. Frontend local environment files and build output are excluded from the build context. The dev-only design gallery is absent from that staff bundle.

Docker uses the repository's single `docker-compose.yaml`. On first start with a fresh database, its initialization job runs migrations and creates the demo accounts, courses, registrations, and results automatically. Both portals wait for the initialized API. Later startup applies pending migrations and preserves existing seeded data.

## Host development

To edit the portals with hot reload, run just the infrastructure, initialization job, and API in Docker:

```powershell
docker compose up --build --wait backend
```

If the full demo is already running, first stop its portal containers with `docker compose stop student admin` so their ports are available. The backend's dependencies remain on its private infrastructure network.

From `frontend/`, use Node 24 or newer and the pnpm version in `package.json`.

```powershell
Copy-Item apps/student/.env.example apps/student/.env.local
Copy-Item apps/admin/.env.example apps/admin/.env.local
pnpm install --frozen-lockfile
pnpm dev
```

Create the local environment files only on first setup. Open [the student portal](http://localhost:3001) or [the staff portal](http://localhost:3002). The demo seed creates `student-maya@demo.example.test`, `lecturer@demo.example.test`, `hod@demo.example.test`, and `super-admin@demo.example.test`. Use the password configured for the seed. The signed-in staff development gallery is at `/design-system` in host development.

## Architecture

| Location                                           | Responsibility                                                                                |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `apps/student`                                     | Next.js routes, HTTP-only token cookies, student profile, registration, and published results |
| `apps/admin`                                       | Vite SPA, browser tab session, scoped staff workflows, administration, reporting, and audit   |
| `packages/theme` and `packages/ui`                 | Source Sans 3, semantic tokens, responsive shells, forms, overlays, and data components       |
| `packages/api-contracts` and `packages/web-client` | Swagger-derived types, runtime response checks, transport, and API error handling             |

The API remains authoritative for permissions. The staff shell uses current privilege grants with their department scope and applies the same rule to navigation and direct URLs. Student bearer credentials live in HTTP-only cookies and are forwarded to Nest only by the Next.js server. Use HTTPS in production and a staff SPA fallback to its `index.html`. Set the server origin to the canonical public student URL. Vite's API URL is public and supplied at build time. See [session handling](docs/sessions.md) for expiry, renewal, logout, and configuration.

## Student workflows

- Create an account at `/sign-up` and sign in with the new credentials. Academic placement is optional at signup. The profile lets students update their names and view the placement and matriculation number on record.
- Open `/registration` to select eligible courses for the current semester and confirm the total credit units. Use registration history to open a saved semester summary, then choose **Print registration summary**. Try the workflow with `student-nora@demo.example.test` and the available `DEMO104` offering.
- Open `/results` to view the cumulative GPA and each semester statement. Phones show each course and its marks in a stacked layout. Choose **Print result statement** for the published grades and averages returned by the API. The demo Maya and Theo accounts have published grades for `DEMO105`, while `DEMO106` is awaiting review.
- The student overview includes the latest registration, published CGPA and semester GPA, direct links, and empty states. These summaries are fetched on the server using the student's own session.

Print actions open a dedicated view in a new tab at `/registration/{semesterId}/print` or `/results/{semesterId}/print`. The view includes student identity, saved academic placement, semester and session, course details, totals, and a generation timestamp. Results also include CA, exam and total scores, grades, grade points, GPA, and CGPA. Choose **Print** on that page to open the browser's print dialog. Portal navigation and print controls are excluded from paper output, tables fit A4 and repeat their headings across pages, and printing uses a light palette regardless of the screen theme. These authenticated pages read the same student-scoped API records as the portal; expired sessions renew before returning to the print view. Empty or unpublished results remain unavailable, and no text file is downloaded.

## Staff workflows

The staff portal supports assigned rosters and marks, departmental review, delegated student registration, academic setup, account and role management, reports, and the read-only audit trail. Open each workspace from the staff menu. The API checks the role and department again for every request. Report choices come from the reporting API and work with a scoped report-only grant.

See the [staff workflow guide](docs/staff-workflows.md) for the permission matrix, record states, component ownership, and verification coverage. Department review choices include inactive departments where the staff member retains review access.

In the disposable demo, the Lecturer can close the `DEMO103` roster, save CA and exam marks, and submit the group. The HOD can request corrections or publish it and can register `DEMO104` for an eligible student. The Super Admin can configure academic records, delegate a custom role, and inspect the audit event for the assignment.

The staff overview shows teaching, review, and reporting summaries according to the current grants. Unsaved marks prompt before navigation or sign-out, and pending saves finish before departure. Rendering failures show a retry screen with a route back to the overview.

## Verification

Run `pnpm check` for formatting, lint, type checks, focused tests, and both production builds. Start with a fresh disposable demo database for `pnpm test:e2e`. The suite creates synthetic accounts, closes a roster permanently, submits and reviews results, and exercises delegated registration and role assignments. Install Playwright Chromium once with `pnpm exec playwright install chromium` and set `UEMP_E2E_PASSWORD` to the demo password in your terminal. Set `STUDENT_API_URL` in the terminal if the demo API uses a different origin from `http://localhost:3000`. An installed Chrome can be used by setting `UEMP_PLAYWRIGHT_CHANNEL=chrome` in the terminal environment.

Run `pnpm contracts:generate` after changing the consumed backend endpoints. Set `UEMP_OPENAPI_FILE` to a Swagger JSON export, or set `UEMP_API_ORIGIN` to the running API origin for its `/docs-json` endpoint. If Swagger requires sign-in, set `UEMP_SWAGGER_USER` and `UEMP_SWAGGER_PASSWORD` in the terminal. The generator keeps the consumed operations and their referenced schemas.

To test the production containers instead of launching dev servers, start a fresh disposable demo and run from `frontend/`:

```powershell
$env:UEMP_E2E_EXTERNAL = "1"
$env:UEMP_E2E_PRODUCTION = "1"
$env:UEMP_E2E_PASSWORD = "your configured demo seed password"
pnpm test:e2e
```

`UEMP_STUDENT_ORIGIN` and `UEMP_ADMIN_ORIGIN` override the default portal origins. `STUDENT_API_URL` selects the browser test's API origin, independently of the student container's private API URL. Production mode checks readiness, SPA deep links, asset caching, and the unavailable design gallery. It skips the two rendering-failure injections that require Vite source modules; those remain covered by the normal dev-server suite. The container-delivery test is skipped in dev-server mode. Clear the two mode variables before running the dev-server suite again.

`GET /health/ready` on the student portal checks the API and otherwise returns a generic 503. It never connects directly to infrastructure. The staff server exposes its own static readiness endpoint at the same path. Both health responses avoid disclosing connection details.
