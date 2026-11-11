# University Education Management Portal

UEMP implements student registration, lecturer marks entry, departmental approval, published results and weighted GPA/CGPA, academic administration, scoped staff privileges, reports, and audit history. The backend uses NestJS, PostgreSQL, and Redis. A Next.js student portal and a React staff portal share the frontend design system and API contracts.

## Start the complete demo

Install Docker with the Compose plugin. No host Node.js installation is needed to run the container stack.

On first setup, copy `backend/.env.example` to `backend/.env` and configure:

| Setting                                       | Value                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| `APP_ENV`                                     | `development` for the demo                                                      |
| `POSTGRES_DB`                                 | A dedicated demo database, such as `uemp_demo`                                  |
| `POSTGRES_PASSWORD`                           | Your local database password                                                    |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | Two different random strings of at least 32 characters                          |
| `DEMO_SEED_PASSWORD`                          | The shared initial demo password; at least 7 characters, at most 72 UTF-8 bytes |

From the repository root, run:

```powershell
docker compose --project-name uemp-demo --env-file backend/.env -f compose.yaml -f compose.demo.yaml up --build --wait
```

That single command builds and starts the complete stack:

1. PostgreSQL and Redis become healthy.
2. The one-shot `migrate` service applies migrations and seeds the demo.
3. The API starts after that job exits successfully.
4. Both portals start after the API is healthy.

| Application    | Address                                 | Readiness                                   |
| -------------- | --------------------------------------- | ------------------------------------------- |
| Student portal | [localhost:3001](http://localhost:3001) | `/health/ready` checks its API              |
| Staff portal   | [localhost:3002](http://localhost:3002) | `/health/ready` checks the static server    |
| API            | [localhost:3000](http://localhost:3000) | `/health/ready` checks PostgreSQL and Redis |

The student portal runs its standalone Next.js server. Nginx serves the built staff app, including direct visits to nested React Router URLs. Both containers run as non-root users. PostgreSQL and Redis use a separate internal network shared only with the API and initialization job. Frontend containers cannot reach those infrastructure services directly. The web ports bind to loopback for local development.

The completed `migrate` container should show `Exited (0)`. It is an initialization job, not a long-running service. The other five services should be healthy.

## Demo accounts

Use `DEMO_SEED_PASSWORD` for newly seeded accounts:

| Account                                                            | Experience                                                           |
| ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `super-admin@demo.example.test`                                    | University setup, accounts, roles, reports, and audit                |
| `hod@demo.example.test`                                            | Department administration, delegated registration, and result review |
| `lecturer@demo.example.test`                                       | Assigned rosters, draft marks, and result submission                 |
| `student@demo.example.test`                                        | Registration and published results                                   |
| `student-maya@demo.example.test`, `student-theo@demo.example.test` | Shared courses with different published grades                       |
| `student-nora@demo.example.test`                                   | Initially empty registration and results                             |

Seeding is repeatable. Restarting does not reset existing accounts, passwords, registrations, marks, or grades. Read the [demo walkthrough](docs/backend-assessment.md#demo-walkthrough) for the sample courses and approval exercise.

## Configuration and container networking

Compose reads configuration from `backend/.env`. Frontend `.env.local` files are only needed for host development and are excluded from Docker builds.

| Setting                            | Default and purpose                                                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                             | Public API port, `3000`                                                                                                                 |
| `STUDENT_PORT`, `ADMIN_PORT`       | Public portal ports, `3001` and `3002`                                                                                                  |
| `PUBLIC_API_URL`                   | Browser-accessible API origin; defaults to `http://localhost:<PORT>`. This is a staff **build argument**, so rebuild after changing it. |
| `STUDENT_APP_ORIGIN`               | Browser-accessible student origin; defaults to `http://localhost:<STUDENT_PORT>`. Used for mutation-origin checks and secure cookies.   |
| `CORS_ORIGINS`                     | Allowed browser origins. Keep it aligned with both portal URLs when changing ports or hostnames.                                        |
| `SWAGGER_USER`, `SWAGGER_PASSWORD` | Optional credentials to enable API documentation at `/docs` outside production                                                          |

Inside Compose, the student server calls `http://backend:3000`. Its access and refresh tokens are HTTP-only cookies; the frontend never connects to Redis or PostgreSQL. The staff browser uses `PUBLIC_API_URL`, not container service names. Backend secrets are not passed to the frontend containers. For remote hosting, configure the public origins and put HTTPS in front of the web services.

`compose.yaml` starts all services and applies migrations. `compose.demo.yaml` adds demo seeding to the initialization job; omit that overlay for a normal application database. Host frontend development uses those same two files with only the backend services selected.

## Development

The [frontend guide](frontend/README.md#host-development) explains how to run both portals with hot reload while keeping infrastructure and the API in Docker. Host development uses Node.js 24+ and pnpm 12.11.2. The [backend guide](backend/README.md) covers local NestJS development and administrator bootstrapping without demo data.

| Location                 | Responsibility                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `backend/`               | API modules, entities, migrations, demo seed, DTOs, instrumentation, and backend tests |
| `frontend/apps/student/` | Student portal with HTTP-only token cookies                                            |
| `frontend/apps/admin/`   | Staff portal with privilege-gated workflows                                            |
| `frontend/packages/`     | Shared theme, UI, contracts, transport, lint, and TypeScript configuration             |
| `frontend/e2e/`          | Real-backend browser regression tests                                                  |
| `docs/`                  | Schema, assessment coverage, grading, approval, and demo documentation                 |

Follow the contributor instructions in [backend/AGENTS.md](backend/AGENTS.md) and [frontend/AGENTS.md](frontend/AGENTS.md). The design gallery is a host-development tool and is excluded from the production staff bundle.

## Verification and operations

Run `pnpm --dir frontend check` and `npm --prefix backend test` for source checks and builds. The [frontend verification guide](frontend/README.md#verification) explains how to run the browser suite against these actual containers without starting host dev servers. Use a fresh disposable demo database because the suite changes registrations, results, accounts, and roles.

Inspect a running demo with:

```powershell
docker compose --project-name uemp-demo --env-file backend/.env -f compose.yaml -f compose.demo.yaml ps -a
docker compose --project-name uemp-demo --env-file backend/.env -f compose.yaml -f compose.demo.yaml logs --tail 100 migrate backend student admin
```

Stop it while preserving PostgreSQL data:

```powershell
docker compose --project-name uemp-demo --env-file backend/.env -f compose.yaml -f compose.demo.yaml down
```

Adding `--volumes` to `down` deletes that project's database. Use it only when deliberately resetting a disposable demo.

See the [schema](docs/schema-review.md), [results and GPA rules](docs/results-workflow.md), [staff workflows](frontend/docs/staff-workflows.md), and [design system](frontend/docs/design-system.md) for implementation details.
