# Security and access

Nest owns authentication, session revocation, authorization and academic publication. Frontend navigation and hidden controls reflect those permissions; every protected operation is authorized again by the API. Both portals use HTTP and have no database or Redis credentials or connectivity.

See [architecture](architecture.md) for request execution and transaction boundaries, [database](database.md) for constraints and retention, [workflows](workflows.md) for resource rules, and [development](development.md) for configuration.

## Accounts, roles and scopes

An account has one type: `student` or `admin`. The same email can have one account of each type, and sign-in includes the type. Students access their own profile, registration and published results. Staff capabilities come from `Role.privileges`, assigned through `AdminRole` with an optional department.

`Role.name` is a human-readable role label such as `hod` or `lecturer`. A null assignment department grants the role's capabilities university-wide; a department ID confines them to that department. Each requested privilege must match the scope on a grant that actually supplies that privilege. Teaching in one department cannot combine with an approval grant elsewhere to authorize approval in the teaching department.

| Capability area          | Enforcement                                                                                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Accounts and directories | Account reads and populated relations are filtered by the caller's privileges and department. Staff-wide lifecycle actions and staff login email changes require the corresponding university-wide authority.                                                                        |
| Academic setup           | Faculties, departments, shared levels, sessions, semesters and catalogue courses require university authority. Programmes, curriculum links and offerings use their owning department.                                                                                               |
| Teaching and marks       | `teach_course` must apply to the offering's department and the caller must be its assigned lecturer. Saving/submitting marks also requires `grade_result` there. A global teaching grant does not bypass lecturer assignment.                                                        |
| Department review        | Reading submitted work requires an applicable review/approve/reopen grant. Each decision checks its own capability in the offering's owning department. Lecturers/HODs cannot approve their own results; only a university-wide protected Super Admin assignment has that exception. |
| Reports                  | `read_reports` is checked for the requested department. Omitting the department requests the whole university and requires a global reporting grant. Lecturer teaching summaries stay tied to their assignments.                                                                     |
| Audit                    | `read_audit` requires university-wide scope. Entries support filtered cursor pagination and cannot be modified through the API.                                                                                                                                                      |

The API resolves current staff grants from PostgreSQL rather than a privilege cache. Write operations read grants and affected data through the same transaction manager and hold the relevant locks. Revoking a role therefore does not depend on waiting for a frontend or token privilege snapshot to expire.

Self-approval is checked again inside the approval transaction. The offering's assigned lecturer, the result group's lecturer, the submitting administrator, and recorded marks contributors must use another approver unless they hold the protected `super_admin` system role through a university-wide assignment. An arbitrary role named “Super Admin”, a department-scoped assignment, or a custom role containing every privilege does not confer this exception. The exception does not bypass `approve_result`, department scope, complete marks, pinned grading policy, or submitted-state checks. The detail response supplies approval eligibility and a readable reason to the staff screen; hiding its button is not the enforcement boundary.

Custom role delegation cannot exceed the assigner's privileges or department scope. Seeded system roles are protected from custom edits/deletion, and university-wide Super Admin assignments require an existing global Super Admin. An HOD can provision the seeded Lecturer grant in their own department during account creation; this narrow operation does not grant general role-management authority. A scoped editor may change a lecturer's names only when every grant on that shared staff profile is within departments they can manage and edit.

## Passwords and authentication endpoints

Passwords use bcrypt with cost 12. Account creation/password-change DTOs require 12–72 characters; the demo seed separately accepts a minimum of seven characters. Every hashing path rejects passwords over 72 UTF-8 bytes because bcrypt would otherwise ignore the excess bytes. Stored hashes are not included in response DTOs.

Sign-in performs a dummy bcrypt comparison for an unknown account and returns the same public credential error for an invalid account/password/type. Signup, sign-in and refresh are limited to 30 requests per 60-second window, per endpoint handler and client address. Redis keys use an HMAC of the address rather than storing the raw address. A rate-store failure rejects authentication temporarily rather than bypassing the limit.

The address is Express's current `request.ip` with a socket fallback. The application does not configure trusted proxy hops. A deployment behind a proxy must deliberately define that trust boundary before relying on per-client limits; accepting arbitrary forwarded addresses would weaken them.

There are no MFA, email-verification or password-reset endpoints in this implementation. Password changes require the currently authenticated account's existing password.

## Token issuance, renewal and revocation

The API issues an access/refresh pair with separate signing secrets. JWT validation pins HS256, issuer `uemp-api`, audience `uemp-client`, token type, expiry and the expected identifier/version claims. Tokens contain internal account/session identifiers and account type, not names, email addresses or privileges. JWTs are signed credentials, not encrypted containers.

| Control           | Behavior                                                                                                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lifetime          | Defaults are 900 seconds for access and 604800 seconds for refresh. Both are configurable; refresh must outlive access. API expiry values are milliseconds since the epoch.                                                                      |
| Account version   | PostgreSQL `authVersion` advances on sign-in, refresh, logout, password/email changes, suspension, explicit session revocation and deletion. Updates compare the expected version so stale concurrent operations cannot replace a newer session. |
| Registry          | Redis stores account version and random token IDs, not raw JWTs. Access requires matching access and refresh-family entries, both subject to TTLs.                                                                                               |
| Refresh claim     | `GETDEL` consumes a refresh entry once. The database version then advances and a new pair is published atomically in Redis. A losing concurrent request must reauthenticate.                                                                     |
| New sign-in       | The API keeps one current token family per account. Signing into that account again makes its previous family stale. A separate student/admin account with the same email is independent.                                                        |
| Logout            | PostgreSQL version advancement revokes the old family before Redis cleanup. A registry cleanup failure cannot restore that session. A stale logout cannot revoke a newer family.                                                                 |
| Lifecycle cleanup | The in-process account saga removes older Redis families after commit. Version checks remain authoritative if cleanup is interrupted.                                                                                                            |

A Redis outage returns a temporary service error for registry operations; it does not fall back to trusting JWT signatures alone. Losing registry data requires signing in again. A failure after consuming a refresh token or advancing the version can also require a fresh sign-in: rotation favors revocation correctness over retaining an old credential.

## Student browser sessions

Student sign-in goes through the same-origin `/api/auth/sign-in` route. Next.js stores access, refresh and their expiry values in four `HttpOnly`, `SameSite=Lax`, path `/` cookies, each expiring with its corresponding token. `Secure` is enabled when the configured `STUDENT_APP_ORIGIN` is HTTPS. Token values are not returned to browser JavaScript or rendered props.

Server components read cookies and fetch Nest directly. They cannot mutate cookies during a streamed render. A missing, rejected or nearly expired access token routes the browser through `/session/refresh`, which posts to `/api/auth/refresh` and writes replacement cookies before returning to the requested page. The student access threshold is 30 seconds before expiry. A small proxy forwards the requested path; it does not rotate tokens.

Return destinations are restricted to local student routes and discard the framework's internal flight query key. The renewal component shares a pending request, including repeated effect setup. Invalid credentials clear cookies and lead to sign-in. Infrastructure failures offer retry without automatically discarding a potentially usable refresh token.

Profile/registration route handlers can refresh and retry one rejected upstream request. Protected print pages use the same server reads and renewal path. Cookie-authenticated mutations require an Origin header exactly matching `STUDENT_APP_ORIGIN`.

Browser authentication requests use a shared Web Lock across tabs so single-use refresh, sign-in and sign-out run in order. Each request reads the current cookies after acquiring the lock. Browsers without Web Locks use a per-tab queue; this fallback does not provide cross-tab exclusion, and a refresh race can require signing in again.

Student tabs share their origin's cookies. Sign-out asks Nest to revoke the session and clears cookies in `finally`, even if the API fails. Another tab returns to sign-in on its next protected read/reload. A queued sign-out waits for renewal before revoking the replacement pair, preventing a pending refresh from restoring a logged-out browser session.

## Staff browser sessions

The staff SPA stores a validated token pair in per-tab `sessionStorage`, with an in-memory fallback when storage is unavailable. It sends bearer tokens directly to Nest. Unlike the student's HTTP-only cookies, these credentials are available to JavaScript executing in the staff origin, so deployment and script integrity remain part of that trust boundary.

Before a protected request, the client refreshes when access expiry is within five minutes. Concurrent requests in that tab share one refresh. An HTTP 401 permits at most one refresh/retry; a permission denial is not treated as token expiry. Requests and responses carry the initiating tab-session identity so delayed responses cannot replace or clear a later sign-in.

Failed refreshes clear that tab's credentials. Sign-out clears local credentials in `finally`, including network/server failures, while preserving any later account switch. Unsaved-marks confirmation happens before the sign-out operation starts.

Staff tabs have independent storage. A new tab without an opener begins signed out; different staff accounts can renew and sign out independently. Duplicating a tab can initially copy its token pair, but the API still has one current family per account. Once one copy rotates or signs in again, the older copy must reauthenticate. Logging out from the stale copy cannot revoke the newer family.

## Input, response and failure boundaries

All JSON request bodies, query strings, parameters and JSON responses use DTO classes. Validators have explicit public messages; unknown fields and malformed inputs are rejected. Response serialization uses the DTO's exposed-field allowlist, which also supplies Swagger documentation.

Database mutations are wrapped so uniqueness/exclusion conflicts, invalid references, checks and concurrent-write failures become useful public responses. A global exception filter trusts only application-authored messages, maps known status codes and hides unexpected internals. HTTP errors may include safe validation messages, a request ID and an active trace ID; they do not expose SQL, driver errors, submitted values or stack traces.

Protected responses and authentication responses use `Cache-Control: no-store`. CORS uses the configured exact origin allowlist, and Helmet adds security headers. Swagger UI and OpenAPI endpoints exist only outside production when both documentation credentials are set; HTTP Basic authentication protects them. The backend disables Helmet's CSP while that interactive documentation is enabled.

## Academic integrity and publication

Students cannot register for another student through self-service, change official marks/placement or access staff operations. Delegated registration checks the staff member's privilege in both the student's current department and any saved term department. Enrollment validates the programme curriculum, owning department, level, current active semester, lecturer availability, duplicate course rule and credit limit in one transaction.

Roster closure is permanent. No late-registration or roster-reopen operation exists. Result reopening only unlocks grading and withdraws publication.

Submitted marks are locked until an authorized correction/reopen transition. Approval uses the offering's pinned policy and saved enrollment units. Student statements, GPA/CGPA and published reports select only groups that are currently approved and whose awards belong to that policy. Snapshot reads prevent a statement from mixing totals before a transition with course rows after it. Database constraints/triggers reinforce these service checks.

## Audit and personal data

Administrator mutations use registered semantic actions and distinguish successful, denied and failed attempts. Result score/award/state changes, roster closure and offering reassignment write success events inside their transaction: audit failure rolls the mutation back. Other administrator mutation audits run separately; if persistence fails after a mutation commits, the failure is logged and the original HTTP outcome is preserved. There is no durable audit-delivery queue.

Events include safe actor/target IDs, action/category, outcome, correlation IDs, and allowlisted academic values needed to explain a result change. Names, email addresses, matriculation numbers, credentials, raw feedback, IP addresses, user agents and complete request/response bodies are excluded. PostgreSQL rejects audit update, delete and truncate operations. Audit is administrator action history, not a record of every student's self-service request; ordinary request outcomes are logged separately.

Account deletion is idempotent. In one transaction it replaces the email with a unique `redacted.invalid` placeholder, clears names and password hash, sets deletion time, advances auth version, clears current student placement and removes matriculation issuance. Academic term snapshots, registrations, results and audit history remain under internal IDs. A separate account of the other type with the original email remains independent.

Deletion also replaces literal, case-insensitive matches for the current email, matriculation number and full name in mutable result notes/feedback. This is not general personal-data recognition: unrelated details, former identifiers and ambiguous lone name words cannot reliably be attributed to an account. Notes should use internal identifiers and avoid personal information. The application does not maintain stored statement/export files; print/download content is generated from current authorized reads.

Structured logs use safe internal IDs and route templates, not raw query strings or payloads. Development/staging emit logs only. Production telemetry is optional; PostgreSQL enhanced reporting and Redis instrumentation are disabled. Any externally configured collector/log destination and its retention policy belong to the deployment.

## Deployment boundary and verification

The supplied Compose stack keeps PostgreSQL and Redis on an internal network and publishes application ports on loopback. Frontend images receive only their application settings. Signing secrets and database credentials remain server-side; student server configuration is not a public browser variable. Use [development configuration](development.md) for the distinction between server API addresses and the staff browser's public API address.

The repository's Compose initializer is for a demo/test database and refuses production seeding. A production deployment needs migration-only initialization, fresh high-entropy distinct signing secrets, HTTPS/TLS termination, controlled proxy behavior, protected infrastructure, and a backup/restore and retention policy. These are deployment responsibilities, not services bundled into the local stack.

Security-relevant regression coverage includes scope/assignment denial, concurrent refresh, revocation, redaction, closed-roster races, result/audit rollback and approved-only weighted GPA. Browser suites cover cookie flags, same-origin mutation rejection, protected print renewal, concurrent tabs, logout failures and stale response handling. The opt-in live-expiry test uses a disposable API with 61-second access and 75-second refresh lifetimes; normal sessions use the configured defaults. Commands and test isolation are documented in [development](development.md), with a reviewer walkthrough in [reviewer guide](reviewer-guide.md).
