import { ApiError } from "@uemp/web-client";
import {
  safeAuthError,
  studentApi,
  verifyMutationOrigin,
} from "../../../../features/auth/server/session";
import { isRecord, isUuid } from "../../../../features/portal/validation";
import {
  readRegistrationSummary,
  type RegistrationInput,
} from "../../../../features/registration/contracts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    verifyMutationOrigin(request);
    const data: unknown = await request.json().catch(() => null);
    if (!isRecord(data) || !isUuid(data["semesterId"]))
      throw new ApiError("Choose a valid semester.", 400);
    const { offeringIds, semesterId } = data;
    if (
      !Array.isArray(offeringIds) ||
      offeringIds.length < 1 ||
      offeringIds.length > 100 ||
      !offeringIds.every(isUuid) ||
      new Set(offeringIds.map((id) => id.toLowerCase())).size !== offeringIds.length
    )
      throw new ApiError("Select between 1 and 100 distinct courses.", 400);
    const input: RegistrationInput = { semesterId, offeringIds };
    const summary = await (
      await studentApi()
    ).request("/v1/student/registrations", readRegistrationSummary, {
      method: "POST",
      authenticated: true,
      json: input,
    });
    return Response.json(summary, {
      status: 201,
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    return safeAuthError(error, "We couldn’t register your courses. Try again.");
  }
}
