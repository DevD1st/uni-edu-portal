# Web sessions

Nest owns token issuance, single-use refresh rotation, account status, revocation, and permissions. Both frontend applications use the HTTP API exclusively. Compose keeps persistence services on an internal infrastructure network; the portals share only the application network with the API.

## Student portal

Sign-in goes through the same-origin `/api/auth/sign-in` handler. It stores the access token, refresh token, and each expiry in four HTTP-only, SameSite=Lax cookies. Each cookie expires with its corresponding token. Secure is enabled when `STUDENT_APP_ORIGIN` uses HTTPS; the HTTP localhost demo remains usable. Browser JavaScript cannot read these cookies, and token values never appear in API responses or rendered props.

Server components read the cookies to fetch the student's records directly from Nest. They do not mutate cookies. A missing, rejected, or nearly expired access token sends the browser through `/session/refresh`, which POSTs to `/api/auth/refresh`. That handler renews the session and updates cookies before returning to the original student page. A small proxy supplies the requested path; it never refreshes tokens. Return destinations are restricted to local student routes and discard the framework's internal flight query key. The renewal screen shares one pending request, including during Strict Mode's repeated effect setup. Invalid refresh credentials clear cookies and return to sign-in. An infrastructure failure shows a retry action without discarding a potentially valid refresh token.

Profile updates and registrations can also renew tokens within their route handlers and retry one rejected request. Print views are protected server-rendered pages and renew through `/session/refresh` before returning to the requested print URL. Same-origin mutations require the configured student Origin header. Cookie-authenticated browser requests use a shared Web Lock across tabs, with a per-tab queue as a fallback where Web Locks are unavailable. This keeps single-use refreshes, sign-in, and sign-out in order without another token store. Every request reads the browser's latest cookies after acquiring the lock.

Sign-out asks Nest to revoke the session and always removes the token cookies in a finally block. Protected reads and authentication responses use `Cache-Control: no-store`.

Student tabs share cookies. Signing out removes them for the entire student origin, and another open tab returns to sign-in on its next protected request or reload. A queued sign-out waits for an ongoing renewal before revoking the replacement pair, so that renewal cannot restore a logged-out session.

## Staff portal

The staff SPA keeps a validated token pair in per-tab sessionStorage, with an in-memory fallback if browser storage is blocked. It forwards bearer tokens directly to Nest. Before authenticated requests, it refreshes when access expiry is within five minutes. Concurrent requests share one refresh. A 401 triggers at most one refresh and retry; a permission denial does not trigger refresh.

Responses remain tied to the tab session that started the request. Delayed results cannot overwrite a later sign-in. Failed refreshes clear that session. Sign-out clears local credentials in finally, including network failures and server errors, and preserves a later account switch. Unsaved-marks confirmation still runs before sign-out begins.

Staff tabs keep independent storage. A new tab without an opener starts signed out; tabs for different accounts can refresh and sign out independently. A duplicated browser tab can initially inherit a copy of its opener's tokens. The API maintains one current pair per account, so rotation or a new sign-in makes an older copy stale. That tab returns to sign-in when it next needs authentication. Logging out from a stale tab cannot revoke the newer pair.

## Configuration

| Variable                     | Consumer and purpose                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `STUDENT_API_URL`            | Next.js server only; Nest origin. Compose supplies `http://backend:3000`; host development defaults to `http://localhost:3000`. |
| `STUDENT_APP_ORIGIN`         | Canonical public student origin for mutation checks and HTTPS cookie settings; defaults to `http://localhost:3001`.             |
| `VITE_API_URL`               | Public staff-browser API origin, embedded at build time. It must be reachable by the user's browser.                            |
| `PUBLIC_API_URL`             | Compose input for the staff `VITE_API_URL` build argument.                                                                      |
| `STUDENT_PORT`, `ADMIN_PORT` | Compose host ports, defaulting to 3001 and 3002.                                                                                |

Existing student sessions from older builds require one fresh sign-in, which removes the legacy session-ID cookie.

## Verification

Run `pnpm exec playwright test e2e/sessions.spec.ts` from `frontend/` to focus on authentication, using the demo backend and environment described in the [frontend guide](../README.md#verification). The session browser suite checks cookie attributes and expiry, absence of tokens in browser-readable state, SSR and client-navigation renewal, return destinations, retry after temporary failure, parallel tab renewal, authenticated writes and print views after expiry, revocation, rejected cross-origin mutations, staff proactive and reactive refresh, concurrent refreshes, and local logout during API failure. The complete workflow suite also verifies registration, marks, approval, publication, privileges, mobile layouts, error recovery, and unsaved marks.

Add `e2e/session-tabs.spec.ts` to check independent and duplicated staff tabs, shared student logout, a renewal/logout race, and exhausted student credentials. `e2e/session-expiry.spec.ts` waits for real access and refresh expiry in both apps. It runs only with `UEMP_E2E_LIVE_EXPIRY=1` against a disposable API configured with `ACCESS_TOKEN_TTL_SECONDS=61` and `REFRESH_TOKEN_TTL_SECONDS=75`; normal suites skip that longer check. Those short lifetimes are test settings only. Restore the usual API settings and clear the flag afterward.
