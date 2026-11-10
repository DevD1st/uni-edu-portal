import { ApiError, createApiClient, readableError } from "@uemp/web-client";

export const portalApi = createApiClient({ baseUrl: "" });

export function studentError(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    window.location.replace("/sign-in");
    return "Your session has ended. Sign in again.";
  }
  if (error instanceof ApiError && error.details.length) return error.details.join(" ");
  return readableError(error);
}
