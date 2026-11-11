# Deploy the frontends on Render

Deploy the student and staff portals as two Docker Web Services using the repository's [render.yaml](../render.yaml) and [shared frontend Dockerfile](../frontend/Dockerfile). Both connect to the existing API at [https://uemp-backend.onrender.com](https://uemp-backend.onrender.com). This configuration creates only the two frontend services; the existing backend, PostgreSQL database and Redis service stay separate.

## Recommended: create a Blueprint

1. Commit and push the deployment changes to the Git branch you will connect to Render. Include `render.yaml` and the updated frontend Dockerfile. Render builds the pushed repository commit, so local changes alone are not available to it.
2. In the Render Dashboard, choose **New > Blueprint**, connect this repository and select that branch. Use the root **Blueprint Path** `render.yaml`.
3. Review the proposed resources: `uemp-student` and `uemp-admin`, both Docker Web Services on the Free plan in Oregon. The list should contain two frontend services and no new backend or datastore.
4. Choose **Deploy Blueprint** and wait for both services to become live. The file configures `/health/ready` as their health check.
5. Open each service and copy its actual HTTPS public URL. Render may assign a different hostname when a name collides; use the displayed URL rather than constructing one from the service name.
6. Complete the existing backend's [CORS configuration](#allow-the-frontend-origins-on-the-existing-backend) before testing staff sign-in.

Render's [Blueprint setup](https://render.com/docs/infrastructure-as-code#setup) documents the repository/branch review and deployment flow. The [Blueprint specification](https://render.com/docs/blueprint-spec) defines the service settings used here.

The student service sets `STUDENT_APP_ORIGIN` from its own Render-assigned `RENDER_EXTERNAL_URL`:

```yaml
- key: STUDENT_APP_ORIGIN
  fromService:
    type: web
    name: uemp-student
    envVarKey: RENDER_EXTERNAL_URL
```

This avoids assuming that `https://uemp-student.onrender.com` is available. If you rename the student service in the Blueprint, update this self-reference's `name` too. Render supports [self-referencing default environment variables](https://render.com/docs/blueprint-spec#self-referencing-environment-variables); referenced values update on Blueprint sync. If you later use a custom student domain, configure its actual HTTPS origin as `STUDENT_APP_ORIGIN` instead.

## Service settings and environment variables

Both services use these paths relative to the repository root:

| Render setting                 | Value                                                 |
| ------------------------------ | ----------------------------------------------------- |
| Language/runtime               | Docker                                                |
| Root Directory                 | Leave blank                                           |
| Dockerfile Path                | `frontend/Dockerfile`                                 |
| Docker Build Context Directory | `frontend`                                            |
| Docker Command                 | Leave blank; use the selected image's default command |
| Health Check Path              | `/health/ready`                                       |

The context must include the entire frontend workspace so the build can access both app manifests, the pnpm lockfile and shared packages. Do not set Root Directory to `frontend` while also using the paths above: Render interprets those paths relative to the root directory. See [Render monorepo path rules](https://render.com/docs/monorepo-support#root-relative-settings).

| Service | Variable             | Value                               | Purpose                                                                                                               |
| ------- | -------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Student | `FRONTEND_APP`       | `student`                           | Selects the Next.js runtime when Docker builds the final stage.                                                       |
| Student | `PORT`               | `10000`                             | Next.js listens on this runtime port.                                                                                 |
| Student | `STUDENT_API_URL`    | `https://uemp-backend.onrender.com` | Server-only API origin used by Next.js.                                                                               |
| Student | `STUDENT_APP_ORIGIN` | Its actual HTTPS public origin      | Used for exact mutation-origin checks and Secure cookies. The Blueprint supplies it through the self-reference above. |
| Staff   | `FRONTEND_APP`       | `admin`                             | Selects the React build served by Nginx.                                                                              |
| Staff   | `PORT`               | `8080`                              | Matches the static server's configured listener.                                                                      |
| Staff   | `VITE_API_URL`       | `https://uemp-backend.onrender.com` | Browser-reachable API origin compiled into the staff JavaScript during the image build.                               |

Render makes Docker service environment variables available as build arguments automatically. The shared Dockerfile declares `ARG FRONTEND_APP` and `ARG VITE_API_URL`, so no separate custom build command or target field is needed. Its default selector is `admin`; forgetting the student service's selector builds the staff app. See [Render Docker environment translation](https://render.com/docs/docker#environment-variable-translation).

These frontend variables contain public origins and app selection only. Do not import the root backend `.env`, link a backend secret environment group, or add PostgreSQL, Redis, JWT signing keys or database connection strings to either frontend service. Frontends authenticate through the HTTP API.

## Allow the frontend origins on the existing backend

In the existing **uemp-backend** Render service, open **Environment** and update `CORS_ORIGINS` with both actual frontend origins, separated by a comma:

```text
https://<actual-student-host>,https://<actual-staff-host>
```

Use the actual Render URLs or custom domains, including `https://`, with no trailing slash or route such as `/sign-in`. Retain any other explicitly allowed origins you still use. Choose **Save and deploy** on the backend so the new runtime configuration takes effect.

This is a change to the existing API service. Keep its database, Redis, signing keys and seeded data as already configured; frontend deployment does not require another migration or seed run. The staff browser calls this API directly, so a correct backend origin allowlist is essential. The student's own `STUDENT_APP_ORIGIN` must independently match the origin in that browser's address bar.

## Alternative: create two Web Services manually

Use this route instead of the Blueprint when configuring the services individually.

1. In Render, choose **New > Web Service**, connect the same repository and branch, and select **Docker** as the language. Choose an available student service name, the Free plan and your intended region.
2. Apply the shared path/health settings above: Root Directory blank, Dockerfile `frontend/Dockerfile`, context `frontend`, health path `/health/ready`, and no Docker Command override. Keep build/start behavior in the Dockerfile rather than adding a pnpm command to the service form. Render documents the [Docker service creation fields](https://render.com/docs/docker#building-from-a-dockerfile).
3. Add the student variables: `FRONTEND_APP=student`, `PORT=10000` and `STUDENT_API_URL=https://uemp-backend.onrender.com`. Set `STUDENT_APP_ORIGIN` to the actual assigned HTTPS origin when it is known. If Render has not shown that URL yet, complete the first deploy, then add the exact origin under **Environment** and choose **Save and deploy** before signing in. The health route can start before that origin is configured.
4. Create a second Docker Web Service for staff using the same repository, branch, Dockerfile, context and health path. Set `FRONTEND_APP=admin`, `PORT=8080` and `VITE_API_URL=https://uemp-backend.onrender.com` before its first build.
5. Copy both displayed public origins and update the existing backend's `CORS_ORIGINS` as described above.

No publish directory is needed: the student service runs a Next.js server, and the staff Docker image already serves its built files with Nginx.

## Redeploying configuration changes

| Change                           | Action in Render                                                                                                                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FRONTEND_APP` on either service | **Save, rebuild, and deploy**. The selector changes which runtime is built.                                                                                                                   |
| Staff `VITE_API_URL`             | **Save, rebuild, and deploy**. Existing JavaScript still contains the old API URL until rebuilt.                                                                                              |
| Student `STUDENT_APP_ORIGIN`     | **Save and deploy**. It is read at runtime; an image rebuild is unnecessary. For a Blueprint-managed value, update its definition and sync the Blueprint so later syncs preserve your intent. |
| Backend `CORS_ORIGINS`           | **Save and deploy** on the existing backend service.                                                                                                                                          |

**Save only** does not update a running service until a later deployment. These are Render's distinct [environment save actions](https://render.com/docs/configure-environment-variables#in-the-render-dashboard).

## Verify the deployed portals

Free web services sleep after inactivity and can take about a minute to start again. Open the API and portal readiness URLs and wait for HTTP 200 before starting the walkthrough after an idle period. See [Render's free-service behavior](https://render.com/docs/free#spinning-down-on-idle).

1. Confirm both frontend services are live and that each public `/health/ready` URL returns HTTP 200. Student readiness checks the API; staff readiness checks its static server.
2. Open the actual student HTTPS URL and sign in with a student account from the [reviewer guide](reviewer-guide.md). Confirm the dashboard, current placement, registration history and published results load. Use the password already seeded in this backend; changing a seed environment variable does not reset existing passwords.
3. Open a registration summary and result statement print view. They should open in a new tab on the student origin and retain their student/semester context. Their Print button should open the browser print dialog.
4. Open the staff HTTPS URL. Sign in as lecturer, HOD or Super Admin and confirm the expected workspaces appear. Reload a permitted nested workspace URL directly to verify the Nginx route fallback. A permission denial for an unauthorized role is expected behavior.
5. Check both portals at phone widths, including 320 and 390 CSS pixels. Confirm navigation, tables and actions remain usable. Sign out and confirm protected pages require sign-in again.

## Troubleshooting

| Symptom                                                            | Check                                                                                                                                                                 |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Student URL shows the staff application                            | Set `FRONTEND_APP=student` on that service, then rebuild and deploy. The Dockerfile defaults to `admin`.                                                              |
| Build cannot find workspace manifests or lockfiles                 | Restore Root Directory blank, Dockerfile Path `frontend/Dockerfile` and Docker Build Context Directory `frontend`.                                                    |
| Staff browser sends requests to `localhost:3000` or an old API URL | Set the correct `VITE_API_URL` and choose **Save, rebuild, and deploy**. A runtime-only deploy cannot rewrite the compiled assets.                                    |
| Student sign-in or writes say to open the student portal           | Match `STUDENT_APP_ORIGIN` to the actual HTTPS address-bar origin, then deploy the runtime configuration. It must be the student URL, not the backend URL.            |
| Browser reports a CORS error in the staff app                      | Update and deploy the existing backend's `CORS_ORIGINS` with the exact staff origin. Check the API's public readiness URL separately if requests cannot connect.      |
| Student readiness fails or records cannot load                     | Check `STUDENT_API_URL`, the existing API's `/health/ready` response and Render service logs. Use its public HTTPS API URL, not the local Compose hostname `backend`. |
| Sign-in reaches the API but returns a credential error             | Use the existing seeded account type/password. Do not rerun migrations or seed to troubleshoot frontend configuration.                                                |

Use [security](security.md) for cookie/session behavior and [development](development.md) for the separate local Docker workflow.
