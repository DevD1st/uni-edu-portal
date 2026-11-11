# University Education Management Portal

UEMP implements student registration, lecturer marks entry, departmental approval, published results and weighted GPA/CGPA, academic administration, scoped staff privileges, reports, and audit history. The backend uses NestJS, PostgreSQL, and Redis. A Next.js student portal and a React staff portal share the frontend design system and API contracts.

## Start the complete demo

Install Docker with the Compose plugin. No host Node.js installation is needed to run the container stack.

On first setup, copy `.env.example` to `.env` in the repository root and configure:

| Setting                                       | Value                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| `APP_ENV`                                     | `development` for the demo                                                      |
| `POSTGRES_DB`                                 | A dedicated demo database, such as `uemp_demo`                                  |
| `POSTGRES_PASSWORD`                           | Your local database password                                                    |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | Two different random strings of at least 32 characters                          |
| `DEMO_SEED_PASSWORD`                          | The shared initial demo password; at least 7 characters, at most 72 UTF-8 bytes |

From the repository root, run:

```powershell
docker compose up --build --wait
```

Docker discovers the single `docker-compose.yaml` automatically. That command builds and starts the complete stack:

1. PostgreSQL and Redis become healthy.
2. The one-shot `migrate` service waits for a working database connection, applies migrations, and seeds the demo.
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

On the first startup with a fresh PostgreSQL volume, the initialization job applies the migrations and creates these accounts, academic setup, courses, registrations, and sample results automatically. No separate migration or seed command is needed.

On later `up` runs, TypeORM applies only pending migrations. The seed checks its completion markers in the database and leaves existing accounts, passwords, registrations, marks, and grades unchanged. A failed seed rolls back its transaction so a subsequent startup can retry. Keep the PostgreSQL volume to preserve this state. Read the [demo walkthrough](docs/backend-assessment.md#demo-walkthrough) for the sample courses and approval exercise.

Changing `DEMO_SEED_PASSWORD` after initialization does not reset existing passwords. Password changes made through the application are preserved.

## Configuration and container networking

Compose automatically reads the root `.env` for substitutions and passes it to the backend and initialization job. Backend commands load the same file regardless of their working directory. No `--env-file` flag or duplicate backend environment file is needed. When upgrading from the earlier backend-local layout, relocate the configured file to the root and keep its existing values. The root `.env` remains Git-ignored and is outside both frontend and backend Docker build contexts. Frontend `.env.local` files are only needed for host development and are excluded from Docker builds.

The default Compose project name is `uemp-demo`, preserving the existing container and PostgreSQL volume names. Plain `docker compose up --build`, `docker compose down`, and `docker compose ps` therefore target the same project. An explicit `--project-name` still overrides it for isolated tests or separate deployments.

| Setting                            | Default and purpose                                                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`                             | Public API port, `3000`                                                                                                                 |
| `STUDENT_PORT`, `ADMIN_PORT`       | Public portal ports, `3001` and `3002`                                                                                                  |
| `PUBLIC_API_URL`                   | Browser-accessible API origin; defaults to `http://localhost:<PORT>`. This is a staff **build argument**, so rebuild after changing it. |
| `STUDENT_APP_ORIGIN`               | Browser-accessible student origin; defaults to `http://localhost:<STUDENT_PORT>`. Used for mutation-origin checks and secure cookies.   |
| `CORS_ORIGINS`                     | Allowed browser origins. Keep it aligned with both portal URLs when changing ports or hostnames.                                        |
| `SWAGGER_USER`, `SWAGGER_PASSWORD` | Optional credentials to enable API documentation at `/docs` outside production                                                          |

Inside Compose, the student server calls `http://backend:3000`. Its access and refresh tokens are HTTP-only cookies; the frontend never connects to Redis or PostgreSQL. The staff browser uses `PUBLIC_API_URL`, not container service names. Backend secrets are not passed to the frontend containers. For remote hosting, configure the public origins and put HTTPS in front of the web services.

`docker-compose.yaml` is the only Compose file. Its `migrate` service runs `npm run db:initialize`, which waits for PostgreSQL, applies pending TypeORM migrations, and runs the demo seed. The API waits for the job to succeed. Database readiness retries temporary DNS and connection failures within a 60-second retry window; incorrect credentials and failed migrations or seeding stop initialization. It targets the non-production demo setup described above. Host frontend development uses the same file with only the backend service and its dependencies selected.

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

The [assessment verification report](docs/assessment-verification.md) maps the original requirements and approved corrections to implementation evidence, executed checks, and remaining submission handoff items.

Run `pnpm --dir frontend check` and `npm --prefix backend test` for source checks and builds. The [frontend verification guide](frontend/README.md#verification) explains how to run the browser suite against these actual containers without starting host dev servers. Use a fresh disposable demo database because the suite changes registrations, results, accounts, and roles.

Use `up --build --wait` after code or configuration changes so images are rebuilt and readiness is checked. A plain `docker compose restart` reuses the existing images and configuration. It can restart the initialization job alongside PostgreSQL, so the job performs its own connection readiness check before migrations or seeding. Keep the same project name and database volume to retain data.

If initialization exits with an error, inspect the `migrate` logs, correct the configuration, and rerun the startup command. The API and portals wait for successful initialization during `up`.

Inspect a running demo with:

```powershell
docker compose ps -a
docker compose logs --tail 100 migrate backend student admin
```

Stop it while preserving PostgreSQL data:

```powershell
docker compose down
```

Adding `--volumes` to `down` deletes that project's database. Use it only when deliberately resetting a disposable demo.

See the [schema](docs/schema-review.md), [results and GPA rules](docs/results-workflow.md), [staff workflows](frontend/docs/staff-workflows.md), and [design system](frontend/docs/design-system.md) for implementation details.
