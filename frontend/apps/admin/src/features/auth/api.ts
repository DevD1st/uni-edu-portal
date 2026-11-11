import {
  readAccount,
  readAuthorization,
  readSession,
  type Session,
  type SignInPayload,
} from "@uemp/api-contracts";
import { ApiError, createApiClient, readNoContent } from "@uemp/web-client";
import { createTabSessionStore } from "@uemp/web-client/session-store";

type StaffSession = { id: string; tokens: Session };

export const staffSession = createTabSessionStore<StaffSession>(
  "uemp:staff:session",
  (value) => {
    if (
      !value ||
      typeof value !== "object" ||
      !("id" in value) ||
      typeof value.id !== "string" ||
      !("tokens" in value)
    )
      throw new Error("Invalid staff session");
    return { id: value.id, tokens: readSession(value.tokens) };
  },
);

const baseUrl =
  (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:3000";
const publicApi = createApiClient({ baseUrl });

export const staffApi = createApiClient({
  baseUrl,
  accessToken: () => staffSession.get()?.tokens.access.token ?? null,
  sessionKey: () => staffSession.get()?.id ?? null,
  async refresh(rejectedToken) {
    const current = staffSession.get();
    if (!current || current.tokens.access.token !== rejectedToken)
      throw new ApiError("Sign in to continue.", 401);
    try {
      const tokens = await publicApi.request("/v1/auth/refresh", readSession, {
        method: "POST",
        json: { refreshToken: current.tokens.refresh.token },
      });
      if (staffSession.get()?.id !== current.id)
        throw new ApiError("Sign in to continue.", 401);
      staffSession.set({ ...current, tokens });
      return tokens.access.token;
    } catch (error) {
      if (
        staffSession.get()?.id === current.id &&
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      )
        staffSession.set(null);
      throw error;
    }
  },
});

export async function signIn(input: Pick<SignInPayload, "email" | "password">) {
  const json: SignInPayload = { ...input, role: "admin" };
  const tokens = await publicApi.request("/v1/auth/sign-in", readSession, {
    method: "POST",
    json,
  });
  staffSession.set({ id: crypto.randomUUID(), tokens });
}

export async function signOut() {
  const id = staffSession.get()?.id;
  try {
    await staffApi.request("/v1/auth/sign-out", readNoContent, {
      method: "POST",
      authenticated: true,
    });
  } catch (error) {
    if (!(error instanceof ApiError) || (error.status !== 401 && error.status !== 403))
      throw error;
  }
  if (staffSession.get()?.id === id) staffSession.set(null);
}

export async function loadStaffAccess(signal: AbortSignal) {
  const options = { authenticated: true, signal };
  const [account, authorization] = await Promise.all([
    staffApi.request("/v1/users/me", readAccount, options),
    staffApi.request("/v1/admin/admins/me/authorization", readAuthorization, options),
  ]);
  if (
    account.role !== "admin" ||
    account.status !== "active" ||
    account.admin?.id !== authorization.adminId
  )
    throw new ApiError("This account cannot access the staff portal.", 403);
  return { account, authorization };
}
