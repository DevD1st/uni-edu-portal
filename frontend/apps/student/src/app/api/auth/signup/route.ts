import { readAccount } from "@uemp/api-contracts";
import { ApiError } from "@uemp/web-client";
import {
  safeAuthError,
  verifyMutationOrigin,
} from "../../../../features/auth/server/session";
import { publicApi } from "../../../../features/portal/server/student-api";
import { isRecord, isUuid } from "../../../../features/portal/validation";
import type { SignupInput } from "../../../../features/auth/signup-contract";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    verifyMutationOrigin(request);
    const data: unknown = await request.json().catch(() => null);
    if (!isRecord(data)) throw new ApiError("Enter your account details.", 400);
    const { email, password } = data;
    if (typeof email !== "string" || !email.trim() || email.length > 254)
      throw new ApiError("Enter a valid email address.", 400);
    if (
      typeof password !== "string" ||
      [...password].length < 12 ||
      new TextEncoder().encode(password).length > 72
    )
      throw new ApiError(
        "Use a password with at least 12 characters and at most 72 bytes.",
        400,
      );
    const input: SignupInput = { email: email.trim(), password };
    for (const name of ["firstName", "lastName"] as const) {
      const value = data[name];
      if (value === undefined) continue;
      if (typeof value !== "string" || value.length > 100)
        throw new ApiError("Each name must be 100 characters or fewer.", 400);
      input[name] = value.trim() || null;
    }
    for (const key of [
      "facultyId",
      "departmentId",
      "courseOfStudyId",
      "academicLevelId",
    ] as const) {
      const value = data[key];
      if (value === undefined) continue;
      if (!isUuid(value)) throw new ApiError("Choose a valid academic placement.", 400);
      input[key] = value;
    }
    await publicApi().request("/v1/auth/signup/student", readAccount, {
      method: "POST",
      json: input,
    });
    return new Response(null, {
      status: 204,
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    return safeAuthError(error, "We couldn’t create your account. Try again.");
  }
}
