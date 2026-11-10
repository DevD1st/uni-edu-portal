# UEMP frontend contributor guide

## Workspace

- Keep the Next.js student portal in `apps/student` and the React/Vite staff portal in `apps/admin`. Run workspace commands from `frontend/` with the pinned pnpm version. Keep one frontend lockfile and pin direct dependencies.
- Shared code lives in `packages/*` and uses the `@uemp/*` scope with `workspace:*`. Applications may import public package exports. Packages never import apps or route implementations. Avoid dependencies between app internals.
- Keep route composition, feature copy, API endpoint adapters, authorization, and product workflows inside the owning app. Group new product modules under `src/features/<domain>`. Extract shared behavior when both apps can use the same contract.
- Keep student route files focused on loading data and composing the page. Put domain UI in the feature’s `components/` directory and server-only data access in its `server/` directory. Share student-specific presentation inside the portal feature.
- Keep TypeScript strict. Treat API payloads, URL parameters, storage, and environment variables as untrusted. Use explicit types and validation at boundaries. Keep generated OpenAPI types in `packages/api-contracts` and regenerate them from the backend contract after endpoint changes.

## Design and accessibility

- Read `docs/design-system.md` before changing visual values, shared components, or shell behavior. Use Source Sans 3 from the theme package and use its semantic tokens in both apps.
- Use the shared theme, Tailwind v4 semantic utilities, and authored CSS for component state or layout. Add a token when a value has a shared role. Keep contrast, keyboard operation, touch, focus, wrapping, and reduced motion in the same change as the UI.
- Design narrow first. Check 320, 390, 768, 1024, and 1440 CSS px. Preserve access to actions and form help when panels stack. Keep intentional table scrolling inside a labeled region. Verify both light and dark modes.
- Present loading, empty, error, restricted, and success states where a feature fetches data. Use readable field and page errors. Pair status colors with labels.

## Access and sessions

- The API authorizes every operation. The staff app uses the current grants from `/v1/admin/admins/me/authorization` for navigation, direct routes, and controls. Treat role names as labels. Match each privilege to its actual department or university-wide grant. Match assignment and result state when the backend requires them. Revalidate grants after a permission change and after a denied operation.
- The student app owns an opaque HTTP-only cookie and a Redis-backed server session. Keep tokens in the server runtime. Serialize rotating refresh calls per session and protect same-origin writes. The admin app owns its tab session and shares one refresh in flight. Clear stale session and protected data after revocation. Never log or expose tokens or raw server errors.
- Keep secrets out of public environment variables, fixtures, screenshots, and commits. Use no-store for protected data. Prefer safe contract errors and request IDs when troubleshooting. Reuse the existing demo backend to exercise real role and scope behavior.

## Verification

- Run `pnpm check` for formatting, lint, strict type checks, targeted tests, and both production builds. Run `pnpm test:e2e` against the demo backend for routing, sign-in, and responsive regression checks. Add coverage for new permission rules and behavior that can regress.
- Keep setup notes and design examples current. Commit source and the generated contract types. Exclude build output, caches, browser reports, dependencies, and local environment files.
