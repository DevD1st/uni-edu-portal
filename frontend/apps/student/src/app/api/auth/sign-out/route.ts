import {
  endStudentSession,
  safeAuthError,
  verifyMutationOrigin,
} from "../../../../features/auth/server/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    verifyMutationOrigin(request);
  } catch (error: unknown) {
    return safeAuthError(error);
  }
  // Always clear the browser's token cookies, including during an API outage.
  await endStudentSession().catch(() => undefined);
  return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
}
