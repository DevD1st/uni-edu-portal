import {
  refreshStudentSession,
  safeAuthError,
  verifyMutationOrigin,
} from "../../../../features/auth/server/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    verifyMutationOrigin(request);
    await refreshStudentSession();
    return new Response(null, {
      status: 204,
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    return safeAuthError(error, "We couldn’t renew your session. Try again.");
  }
}
