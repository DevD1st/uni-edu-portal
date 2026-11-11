import "server-only";

import { notFound } from "next/navigation";
import { ApiError, createApiClient } from "@uemp/web-client";
import { studentConfig } from "../../auth/server/config";
import {
  studentApi,
  safeAuthError,
  redirectToStudentSession,
} from "../../auth/server/session";
import { isUuid } from "../validation";

export function publicApi() {
  return createApiClient({ baseUrl: studentConfig().api.origin, timeoutMs: 8_000 });
}

export async function readStudent<T>(path: string, decode: (body: unknown) => T) {
  try {
    return await (await studentApi()).request(path, decode, { authenticated: true });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401)
      return redirectToStudentSession();
    throw error;
  }
}

export async function readStudentTerm<T>(
  id: string,
  path: string,
  decode: (body: unknown) => T,
) {
  if (!isUuid(id)) notFound();
  try {
    return await readStudent(path, decode);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function downloadStudentTerm(id: string, path: string, filename: string) {
  try {
    if (!isUuid(id)) throw new ApiError("Choose a valid semester.", 400);
    const file = await (
      await studentApi({ canRefresh: true })
    ).download(path, { authenticated: true });
    return new Response(file, {
      headers: {
        "cache-control": "private, no-store",
        "content-type": "text/plain; charset=utf-8",
        "content-disposition": 'attachment; filename="' + filename + '"',
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    return safeAuthError(error, "We couldn’t download this document. Try again.");
  }
}
