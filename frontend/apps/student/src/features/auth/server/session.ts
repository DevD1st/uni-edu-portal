import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import {
  readAccount,
  readSession,
  type Session,
  type SignInInput,
} from "@uemp/api-contracts";
import { ApiError, createApiClient, readNoContent } from "@uemp/web-client";
import { studentReturnTo } from "../session-policy";
import { studentConfig } from "./config";

const names = {
  access: "uemp_student_access",
  accessExpiry: "uemp_student_access_expires",
  refresh: "uemp_student_refresh",
  refreshExpiry: "uemp_student_refresh_expires",
} as const;
const refreshEarlyMs = 30_000;

function upstream(accessToken?: string) {
  return createApiClient({
    baseUrl: studentConfig().api.origin,
    timeoutMs: 8000,
    ...(accessToken ? { accessToken: () => accessToken } : {}),
  });
}

async function sessionToken(kind: "access" | "refresh") {
  const jar = await cookies();
  const token = jar.get(names[kind])?.value;
  const expiresAt = Number(
    jar.get(names[kind === "access" ? "accessExpiry" : "refreshExpiry"])?.value,
  );
  return token && token.length <= 4096 && Number.isSafeInteger(expiresAt)
    ? { token, expiresAt }
    : null;
}

async function setSessionCookies(tokens: Session) {
  const jar = await cookies();
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: studentConfig().app.protocol === "https:",
    path: "/",
  };
  for (const kind of ["access", "refresh"] as const) {
    const value = tokens[kind];
    const expires = new Date(value.expiresAt);
    jar.set(names[kind], value.token, { ...options, expires });
    jar.set(
      names[kind === "access" ? "accessExpiry" : "refreshExpiry"],
      String(value.expiresAt),
      {
        ...options,
        expires,
      },
    );
  }
  // Retire the previous cookie when an existing browser signs in after the upgrade.
  jar.delete("uemp_student_session");
}

async function clearSessionCookies() {
  const jar = await cookies();
  for (const name of [...Object.values(names), "uemp_student_session"])
    jar.delete(name);
}

function sessionEnded() {
  return new ApiError("Your session has ended. Sign in again.", 401);
}

async function refreshSession() {
  const refresh = await sessionToken("refresh");
  if (!refresh || refresh.expiresAt <= Date.now()) {
    await clearSessionCookies();
    throw sessionEnded();
  }
  try {
    const tokens = await upstream().request("/v1/auth/refresh", readSession, {
      method: "POST",
      json: { refreshToken: refresh.token },
    });
    // Persist the rotated pair before any follow-up read: the old refresh is spent.
    await setSessionCookies(tokens);
    const account = await upstream(tokens.access.token).request(
      "/v1/users/me",
      readAccount,
      { authenticated: true },
    );
    if (account.role !== "student")
      throw new ApiError("Use a student account to access this portal.", 403);
    return tokens.access.token;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403))
      await clearSessionCookies();
    throw error;
  }
}

export async function studentApi({ canRefresh = false } = {}) {
  const access = await sessionToken("access");
  const token =
    access && access.expiresAt > Date.now() + refreshEarlyMs
      ? access.token
      : canRefresh
        ? await refreshSession()
        : null;
  if (!token) throw sessionEnded();
  return createApiClient({
    baseUrl: studentConfig().api.origin,
    timeoutMs: 8000,
    accessToken: () => token,
    // Cookie writes belong to route handlers, never to a streamed server render.
    ...(canRefresh ? { refresh: refreshSession } : {}),
  });
}

export async function redirectToStudentSession(): Promise<never> {
  const refresh = await sessionToken("refresh");
  if (!refresh || refresh.expiresAt <= Date.now()) redirect("/sign-in");
  const returnTo = studentReturnTo((await headers()).get("x-uemp-student-path"));
  redirect("/session/refresh?returnTo=" + encodeURIComponent(returnTo));
}

export const studentAccount = cache(async () => {
  try {
    const account = await (
      await studentApi()
    ).request("/v1/users/me", readAccount, {
      authenticated: true,
    });
    if (account.role !== "student") throw sessionEnded();
    return account;
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401)
      return redirectToStudentSession();
    throw error;
  }
});

export async function refreshStudentSession() {
  const access = await sessionToken("access");
  if (access && access.expiresAt > Date.now() + refreshEarlyMs) {
    try {
      // Another tab may already have renewed the shared cookies while this one waited.
      const account = await upstream(access.token).request(
        "/v1/users/me",
        readAccount,
        { authenticated: true },
      );
      if (account.role !== "student") {
        await clearSessionCookies();
        throw new ApiError("Use a student account to access this portal.", 403);
      }
      return;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) throw error;
    }
  }
  await refreshSession();
}

export async function startStudentSession(email: string, password: string) {
  const input: SignInInput = { email, password, role: "student" };
  const tokens = await upstream().request("/v1/auth/sign-in", readSession, {
    method: "POST",
    json: input,
  });
  await setSessionCookies(tokens);
}

export async function endStudentSession() {
  try {
    await (
      await studentApi({ canRefresh: true })
    ).request("/v1/auth/sign-out", readNoContent, {
      method: "POST",
      authenticated: true,
    });
  } finally {
    await clearSessionCookies();
  }
}

export function verifyMutationOrigin(request: Request) {
  if (request.headers.get("origin") !== studentConfig().app.origin)
    throw new ApiError("Open the student portal to continue.", 403);
}

export function safeAuthError(
  error: unknown,
  fallback = "Sign-in is temporarily unavailable. Try again.",
) {
  const statusCode =
    error instanceof ApiError && error.status >= 400 ? error.status : 503;
  const message = error instanceof ApiError ? error.message : fallback;
  const requestId = error instanceof ApiError ? error.requestId : undefined;
  return Response.json(
    {
      statusCode,
      message,
      ...(error instanceof ApiError && error.details.length
        ? { errors: error.details }
        : {}),
      ...(requestId ? { requestId } : {}),
    },
    { status: statusCode, headers: { "cache-control": "no-store" } },
  );
}
