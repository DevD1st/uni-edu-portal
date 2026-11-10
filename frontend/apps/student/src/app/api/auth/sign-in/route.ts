import { ApiError } from "@uemp/web-client";
import {
  safeAuthError,
  startStudentSession,
  verifyMutationOrigin,
} from "../../../../features/auth/server/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    verifyMutationOrigin(request);
    const data: unknown = await request.json().catch(() => null);
    if (
      !data ||
      typeof data !== "object" ||
      !("email" in data) ||
      !("password" in data) ||
      typeof data.email !== "string" ||
      typeof data.password !== "string" ||
      !data.email.trim() ||
      !data.password ||
      data.email.length > 254 ||
      data.password.length > 72
    )
      throw new ApiError("Enter a valid email address and password.", 400);
    await startStudentSession(data.email.trim(), data.password);
    return new Response(null, {
      status: 204,
      headers: { "cache-control": "no-store" },
    });
  } catch (error: unknown) {
    return safeAuthError(error);
  }
}
