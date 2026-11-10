# UEMP web workspace

The student portal runs on Next.js at port 3001. The staff portal runs on React and Vite at port 3002. Both share the theme, component library, API transport, and generated contracts. Read [AGENTS.md](AGENTS.md) and the [design system](docs/design-system.md) before contributing.

## Local development

From the repository root, prepare the backend environment using the backend README. Set a demo seed password and allow both frontend origins in the backend CORS configuration. Start the stack with the demo and frontend overlays.

```powershell
docker compose --env-file backend/.env -f compose.yaml -f compose.demo.yaml -f compose.frontend.yaml up --build --wait
```

The frontend overlay publishes the existing Redis service on loopback port 6380 for the student server. Adjust `STUDENT_REDIS_PORT` and `STUDENT_REDIS_URL` together if the port is occupied.

From `frontend/`, use Node 24 or newer and the pnpm version in `package.json`.

```powershell
Copy-Item apps/student/.env.example apps/student/.env.local
Copy-Item apps/admin/.env.example apps/admin/.env.local
pnpm install --frozen-lockfile
pnpm dev
```

Open [the student portal](http://localhost:3001) or [the staff portal](http://localhost:3002). The demo seed creates `student-maya@demo.example.test`, `lecturer@demo.example.test`, `hod@demo.example.test`, and `super-admin@demo.example.test`. Use the password configured for the seed. The signed-in staff development gallery is at `/design-system`.

## Architecture

| Location                                           | Responsibility                                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `apps/student`                                     | Next.js routes, server-owned Redis sessions, student overview and profile                         |
| `apps/admin`                                       | Vite SPA, browser tab session, scope-aware navigation and routes, teaching and review entry views |
| `packages/theme` and `packages/ui`                 | Source Sans 3, semantic tokens, responsive shells, forms, overlays, and data components           |
| `packages/api-contracts` and `packages/web-client` | Swagger-derived types, runtime response checks, transport, and API error handling                 |

The API remains authoritative for permissions. The staff shell uses current privilege grants with their department scope and applies the same rule to navigation and direct URLs. The student server keeps bearer credentials in Redis and sets an opaque HTTP-only cookie. Use HTTPS in production, private Redis, and a staff SPA fallback to its `index.html`. Set the server origin to the canonical public student URL. Vite's API URL is public and supplied at build time.

## Student workflows

- Create an account at `/sign-up` and sign in with the new credentials. Academic placement is optional at signup. The profile lets students update their names and view the placement and matriculation number on record.
- Open `/registration` to select eligible courses for the current semester and confirm the total credit units. Use registration history to open or download a saved semester summary. Try the workflow with `student-nora@demo.example.test` and the available `DEMO104` offering.
- Open `/results` to view the cumulative GPA and each semester statement. Phones show each course and its marks in a stacked layout. Statements and downloads show the published grades and averages returned by the API. The demo Maya and Theo accounts have published grades for `DEMO105`, while `DEMO106` is awaiting review.

## Verification

Run `pnpm check` for formatting, lint, type checks, focused tests, and both production builds. Use a disposable demo API and Redis for `pnpm test:e2e`. The suite creates a synthetic student, changes the demo semester's credit limit during registration, and approves and reopens a demo result. Install Playwright Chromium once with `pnpm exec playwright install chromium` and set `UEMP_E2E_PASSWORD` to the demo password in your terminal. Set `STUDENT_API_URL` in the terminal if the demo API uses a different origin from `http://localhost:3000`. An installed Chrome can be used by setting `UEMP_PLAYWRIGHT_CHANNEL=chrome` in the terminal environment.

Run `pnpm contracts:generate` after changing the consumed backend endpoints. Set `UEMP_OPENAPI_FILE` to a Swagger JSON export, or set `UEMP_API_ORIGIN` to the running API origin for its `/docs-json` endpoint. If Swagger requires sign-in, set `UEMP_SWAGGER_USER` and `UEMP_SWAGGER_PASSWORD` in the terminal. The generator keeps the consumed operations and their referenced schemas.
