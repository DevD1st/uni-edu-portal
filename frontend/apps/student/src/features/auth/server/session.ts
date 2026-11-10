import "server-only";

import { randomBytes } from "node:crypto";
import { setTimeout as wait } from "node:timers/promises";
import { cookies } from "next/headers";
import { cache } from "react";
import { Redis } from "ioredis";
import {
  readAccount,
  readSession,
  type Session,
  type SignInInput,
  type RefreshInput,
} from "@uemp/api-contracts";
import { ApiError, createApiClient, readNoContent } from "@uemp/web-client";
import { studentConfig } from "./config";

const prefix = "uemp:web:student:v1:";
const cookieName = "uemp_student_session";
const idPattern = /^[A-Za-z0-9_-]{43}$/;
let store: Redis | undefined;

function redis() {
  store ??= new Redis(studentConfig().redis.href, {
    connectTimeout: 3000,
    commandTimeout: 3500,
    maxRetriesPerRequest: 1,
  });
  return store;
}

function upstream() {
  return createApiClient({ baseUrl: studentConfig().api.origin, timeoutMs: 8000 });
}

async function readStored(id: string): Promise<Session | null> {
  const raw = await redis().get(prefix + id);
  if (!raw) return null;
  try {
    const session = readSession(JSON.parse(raw));
    return session.refresh.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

function sessionEnded() {
  return new ApiError("Your session has ended. Sign in again.", 401);
}

async function renew(id: string, rejectedToken: string): Promise<string> {
  const key = prefix + id;
  const lock = key + ":refresh";
  const owner = randomBytes(16).toString("base64url");
  const connection = redis();
  const deadline = Date.now() + 12_000;

  while (Date.now() < deadline) {
    const current = await readStored(id);
    if (!current) throw sessionEnded();
    if (current.access.token !== rejectedToken) return current.access.token;
    if ((await connection.set(lock, owner, "PX", 25_000, "NX")) !== "OK") {
      await wait(85);
      continue;
    }
    try {
      const locked = await readStored(id);
      if (!locked) throw sessionEnded();
      if (locked.access.token !== rejectedToken) return locked.access.token;
      let rotated: Session;
      try {
        const input: RefreshInput = { refreshToken: locked.refresh.token };
        rotated = await upstream().request("/v1/auth/refresh", readSession, {
          method: "POST",
          json: input,
        });
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401)
          await connection.eval(
            "if redis.call('GET', KEYS[2]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end",
            2,
            key,
            lock,
            owner,
          );
        throw error;
      }
      // A concurrent logout can remove the session while the refresh is in flight.
      const saved = await connection.eval(
        "if redis.call('GET', KEYS[2]) == ARGV[1] and redis.call('EXISTS', KEYS[1]) == 1 then redis.call('SET', KEYS[1], ARGV[2], 'PXAT', ARGV[3]); return 1 end; return 0",
        2,
        key,
        lock,
        owner,
        JSON.stringify(rotated),
        rotated.refresh.expiresAt,
      );
      if (saved !== 1) throw sessionEnded();
      return rotated.access.token;
    } finally {
      await connection
        .eval(
          "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end",
          1,
          lock,
          owner,
        )
        .catch(() => undefined);
    }
  }
  throw new ApiError("Your session is still refreshing. Try again.", 503);
}

async function authenticated(id: string) {
  const initial = await readStored(id);
  if (!initial) throw sessionEnded();
  const accessToken =
    initial.access.expiresAt <= Date.now()
      ? await renew(id, initial.access.token)
      : initial.access.token;
  return createApiClient({
    baseUrl: studentConfig().api.origin,
    timeoutMs: 8000,
    accessToken: () => accessToken,
    refresh: (token) => renew(id, token),
  });
}

async function cookieId() {
  const value = (await cookies()).get(cookieName)?.value;
  return value && idPattern.test(value) ? value : null;
}

export const studentAccount = cache(async () => {
  const id = await cookieId();
  if (!id) return null;
  try {
    const account = await (
      await authenticated(id)
    ).request("/v1/users/me", readAccount, { authenticated: true });
    if (account.role !== "student") throw sessionEnded();
    return account;
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});

export async function startStudentSession(email: string, password: string) {
  const input: SignInInput = { email, password, role: "student" };
  const tokens = await upstream().request("/v1/auth/sign-in", readSession, {
    method: "POST",
    json: input,
  });
  const jar = await cookies();
  const previous = await cookieId();
  const id = randomBytes(32).toString("base64url");
  const connection = redis();
  if (previous) {
    await connection
      .multi()
      .set(prefix + id, JSON.stringify(tokens), "PXAT", tokens.refresh.expiresAt)
      .del(prefix + previous)
      .exec();
    // A Redis transaction can complete with individual command errors.
    if (!(await connection.exists(prefix + id)))
      throw new ApiError("We couldn't start your session. Try again.", 503);
  } else {
    await connection.set(
      prefix + id,
      JSON.stringify(tokens),
      "PXAT",
      tokens.refresh.expiresAt,
    );
  }
  jar.set(cookieName, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: studentConfig().app.protocol === "https:",
    path: "/",
  });
}

export async function endStudentSession() {
  const id = await cookieId();
  try {
    if (!id) return;
    try {
      await (
        await authenticated(id)
      ).request("/v1/auth/sign-out", readNoContent, {
        method: "POST",
        authenticated: true,
      });
    } finally {
      await redis().del(prefix + id);
    }
  } finally {
    (await cookies()).delete(cookieName);
  }
}

export function verifyMutationOrigin(request: Request) {
  if (request.headers.get("origin") !== studentConfig().app.origin)
    throw new ApiError("Open the student portal to continue.", 403);
}

export function safeAuthError(error: unknown) {
  const statusCode =
    error instanceof ApiError && error.status >= 400 ? error.status : 503;
  const message =
    error instanceof ApiError
      ? error.message
      : "Sign-in is temporarily unavailable. Try again.";
  const requestId = error instanceof ApiError ? error.requestId : undefined;
  return Response.json(
    { statusCode, message, ...(requestId ? { requestId } : {}) },
    {
      status: statusCode,
      headers: { "cache-control": "no-store" },
    },
  );
}
