import { readAccount, type components } from "@uemp/api-contracts";
import { ApiError } from "@uemp/web-client";
import {
  safeAuthError,
  studentApi,
  verifyMutationOrigin,
} from "../../../../features/auth/server/session";
import { isRecord } from "../../../../features/portal/validation";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    verifyMutationOrigin(request);
    const data: unknown = await request.json().catch(() => null);
    if (!isRecord(data)) throw new ApiError("Enter your profile details.", 400);
    const input: components["schemas"]["ProfileDto"] = {};
    for (const name of ["firstName", "lastName"] as const) {
      const value = data[name];
      if (value === undefined) continue;
      if (value !== null && (typeof value !== "string" || value.length > 100))
        throw new ApiError("Each name must be 100 characters or fewer.", 400);
      input[name] = value?.trim() || null;
    }
    if (Object.keys(input).length === 0)
      throw new ApiError("Enter a name to update.", 400);
    const account = await (
      await studentApi()
    ).request("/v1/users/me", readAccount, {
      method: "PATCH",
      authenticated: true,
      json: input,
    });
    return Response.json(account, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return safeAuthError(error, "We couldn’t save your profile. Try again.");
  }
}
