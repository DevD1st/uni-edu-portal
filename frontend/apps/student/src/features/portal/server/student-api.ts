import "server-only";

import { notFound } from "next/navigation";
import { ApiError, createApiClient } from "@uemp/web-client";
import { studentConfig } from "../../auth/server/config";
import { studentApi, redirectToStudentSession } from "../../auth/server/session";
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
