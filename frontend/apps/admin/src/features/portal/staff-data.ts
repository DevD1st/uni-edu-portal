import { useEffect, useRef, useState } from "react";
import { dto, type Dto, type DtoName } from "@uemp/api-contracts/response";
import { ApiError, readNoContent, readableError } from "@uemp/web-client";
import { staffApi } from "../auth/api";
import { useAuth } from "../auth/provider";

export function staffPath(
  path: string,
  params: Record<string, string | undefined | null>,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  return query.size ? path + "?" + query : path;
}

type Method = "POST" | "PUT" | "PATCH" | "DELETE";

export function writeStaff<Name extends DtoName>(
  path: string,
  method: Method,
  schema: Name,
  json: unknown,
) {
  return staffApi.request(path, dto(schema), { method, authenticated: true, json });
}

export function changeStaff(path: string, method: Method) {
  return staffApi.request(path, readNoContent, { method, authenticated: true });
}

type State<T> =
  | { key: string; data: T; error?: never }
  | { key: string; data?: never; error: string };

function denied(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

export function staffError(error: unknown) {
  if (error instanceof ApiError && error.details.length) return error.details.join(" ");
  return readableError(error);
}

export function useStaffResource<Name extends DtoName>(
  path: string | null,
  schema: Name,
) {
  const { revalidate } = useAuth();
  const [version, setVersion] = useState(0);
  const key = path ? version + ":" + path : "";
  const [result, setResult] = useState<State<Dto<Name>>>();

  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    void staffApi
      .request(path, dto(schema), { authenticated: true, signal: controller.signal })
      .then(
        (data) => {
          if (!controller.signal.aborted) setResult({ key, data });
        },
        (error: unknown) => {
          if (controller.signal.aborted) return;
          setResult({ key, error: staffError(error) });
          if (denied(error)) revalidate();
        },
      );
    return () => controller.abort();
  }, [key, path, schema, revalidate]);

  const current = result?.key === key ? result : undefined;
  return {
    data: current?.data,
    error: current?.error,
    reload: () => setVersion((old) => old + 1),
  };
}

export function useStaffAction() {
  const { revalidate } = useAuth();
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  async function run<T>(
    action: () => Promise<T>,
    message: string,
    completed?: (value: T) => void,
  ) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      const value = await action();
      setSuccess(message);
      completed?.(value);
    } catch (error) {
      setError(staffError(error));
      if (denied(error)) revalidate();
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  function reset() {
    setError(undefined);
    setSuccess(undefined);
  }

  return { pending, error, success, run, reset };
}

export function useStaffAccess() {
  const { access, revalidate } = useAuth();
  if (!access) throw new Error("Staff access is required.");
  return {
    grants: access.authorization.grants,
    adminId: access.authorization.adminId,
    userId: access.account.id,
    revalidate,
  };
}

export function useCursor() {
  const [pages, setPages] = useState<string[]>([]);
  return {
    value: pages.at(-1),
    page: pages.length + 1,
    previous: pages.length
      ? () => setPages((current) => current.slice(0, -1))
      : undefined,
    next: (cursor: string) => setPages((current) => [...current, cursor]),
  };
}
