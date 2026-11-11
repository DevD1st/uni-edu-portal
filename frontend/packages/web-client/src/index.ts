import { readError } from "@uemp/api-contracts";

export class ApiError extends Error {
  readonly status: number;
  readonly details: readonly string[];
  readonly requestId: string | undefined;

  constructor(
    message: string,
    status: number,
    details: readonly string[] = [],
    requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

export function readableError(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "We couldn't complete this request. Try again.";
}

type RequestOptions = Omit<RequestInit, "body"> & {
  json?: unknown;
  authenticated?: boolean;
  retryUnauthorized?: boolean;
};

type ApiClientOptions = {
  baseUrl: string;
  timeoutMs?: number;
  accessToken?: () => string | null;
  authorize?: () => Promise<string>;
  sessionKey?: () => string | null;
  refresh?: (rejectedToken: string) => Promise<string>;
  fetcher?: typeof fetch;
};

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  return response.json().catch(() => undefined);
}

export function createApiClient({
  baseUrl,
  timeoutMs = 10_000,
  accessToken,
  authorize,
  sessionKey,
  refresh,
  fetcher = fetch,
}: ApiClientOptions) {
  let inFlight: { token: string; promise: Promise<string> } | undefined;

  async function renew(rejectedToken: string): Promise<string> {
    const current = accessToken?.();
    if (current && current !== rejectedToken) return current;
    if (!current || !refresh) throw new ApiError("Sign in to continue.", 401);
    if (inFlight?.token === rejectedToken) return inFlight.promise;
    const promise = refresh(rejectedToken);
    inFlight = { token: rejectedToken, promise };
    try {
      return await promise;
    } finally {
      if (inFlight?.promise === promise) inFlight = undefined;
    }
  }

  async function send(path: string, options: RequestOptions, accept: string) {
    if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\"))
      throw new Error("An API path must be relative to the configured origin.");
    const {
      json,
      authenticated = false,
      retryUnauthorized = true,
      signal,
      ...init
    } = options;
    const session = authenticated ? sessionKey?.() : undefined;
    function assertCurrentSession() {
      if (authenticated && sessionKey && sessionKey() !== session)
        throw new ApiError("Sign in to continue.", 401);
    }
    const token = authenticated
      ? authorize
        ? await authorize()
        : accessToken?.()
      : undefined;
    assertCurrentSession();
    if (authenticated && !token) throw new ApiError("Sign in to continue.", 401);
    const headers = new Headers(init.headers);
    headers.set("accept", accept);
    if (json !== undefined) headers.set("content-type", "application/json");

    async function fetchWithToken(currentToken?: string) {
      const outgoingHeaders = new Headers(headers);
      if (currentToken) outgoingHeaders.set("authorization", "Bearer " + currentToken);
      const timeout = AbortSignal.timeout(timeoutMs);
      const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
      try {
        return await fetcher(baseUrl.replace(/\/$/, "") + path, {
          ...init,
          headers: outgoingHeaders,
          signal: requestSignal,
          cache: "no-store",
          redirect: "error",
          ...(json === undefined ? {} : { body: JSON.stringify(json) }),
        });
      } catch (error: unknown) {
        if (signal?.aborted) throw error;
        if (timeout.aborted)
          throw new ApiError("The request took too long. Try again.", 408);
        throw new ApiError(
          "We couldn't reach the server. Check your connection and try again.",
          0,
        );
      }
    }

    let response = await fetchWithToken(token ?? undefined);
    assertCurrentSession();
    // The API rejects expired bearer credentials before executing a controller.
    if (response.status === 401 && token && retryUnauthorized && refresh) {
      void response.body?.cancel().catch(() => undefined);
      const renewed = await renew(token);
      assertCurrentSession();
      response = await fetchWithToken(renewed);
      assertCurrentSession();
    }
    if (!response.ok) {
      const payload = readError(await readBody(response));
      assertCurrentSession();
      throw new ApiError(
        payload?.message ?? "We couldn't complete this request. Try again.",
        response.status,
        payload?.errors,
        payload?.requestId ?? response.headers.get("x-request-id") ?? undefined,
      );
    }
    return { response, assertCurrentSession };
  }

  return {
    async request<T>(
      path: string,
      decode: (body: unknown) => T,
      options: RequestOptions = {},
    ): Promise<T> {
      const { response, assertCurrentSession } = await send(
        path,
        options,
        "application/json",
      );
      const body = await readBody(response);
      assertCurrentSession();
      try {
        return decode(body);
      } catch {
        throw new ApiError("The server sent an unexpected response. Try again.", 502);
      }
    },
    async download(path: string, options: RequestOptions = {}): Promise<Blob> {
      const { response, assertCurrentSession } = await send(path, options, "*/*");
      const body = await response.blob();
      assertCurrentSession();
      return body;
    },
  };
}

export function readNoContent(value: unknown): undefined {
  if (value !== undefined) throw new Error("Expected an empty response");
  return undefined;
}
