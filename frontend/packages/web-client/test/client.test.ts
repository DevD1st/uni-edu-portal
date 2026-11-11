import assert from "node:assert/strict";
import test from "node:test";
import { ApiError, createApiClient, readNoContent } from "../src/index.ts";

void test("authorization renews credentials before sending the first protected request", async () => {
  const sent: string[] = [];
  const client = createApiClient({
    baseUrl: "https://example.test",
    accessToken: () => "old",
    authorize: async () => "renewed",
    fetcher: async (_url, init) => {
      sent.push(new Headers(init?.headers).get("authorization") ?? "");
      return new Response(null, { status: 204 });
    },
  });
  await client.request("/v1/test", readNoContent, { authenticated: true });
  assert.deepEqual(sent, ["Bearer renewed"]);
});

void test("an account switch during proactive authorization prevents the old request", async () => {
  let session = "first";
  let requests = 0;
  const client = createApiClient({
    baseUrl: "https://example.test",
    sessionKey: () => session,
    authorize: async () => {
      session = "second";
      return "first-token";
    },
    fetcher: async () => {
      requests += 1;
      return new Response(null, { status: 204 });
    },
  });
  await assert.rejects(
    client.request("/v1/test", readNoContent, { authenticated: true }),
    (error: unknown) => error instanceof ApiError && error.status === 401,
  );
  assert.equal(requests, 0);
});

void test("two unauthorized requests share one refresh and retry with the new token", async () => {
  let token = "old";
  let refreshes = 0;
  const client = createApiClient({
    baseUrl: "https://example.test",
    accessToken: () => token,
    async refresh(rejectedToken) {
      assert.equal(rejectedToken, "old");
      refreshes += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      token = "new";
      return token;
    },
    fetcher: async (_url, options) =>
      new Response(null, {
        status:
          new Headers(options?.headers).get("authorization") === "Bearer new"
            ? 204
            : 401,
      }),
  });
  await Promise.all(
    [1, 2].map(() =>
      client.request("/v1/test", readNoContent, { authenticated: true }),
    ),
  );
  assert.equal(refreshes, 1);
});

void test("a permission denial surfaces the request ID without refreshing", async () => {
  const client = createApiClient({
    baseUrl: "https://example.test",
    accessToken: () => "current",
    refresh: async () => {
      throw new Error("A 403 must not refresh");
    },
    fetcher: async () =>
      Response.json(
        {
          statusCode: 403,
          message: "You do not have access.",
          requestId: "fixture-id",
        },
        { status: 403 },
      ),
  });
  await assert.rejects(
    client.request("/v1/test", readNoContent, { authenticated: true }),
    (error: unknown) =>
      error instanceof ApiError &&
      error.status === 403 &&
      error.requestId === "fixture-id",
  );
});

void test("an old request cannot refresh or replay after an account switch", async () => {
  let session = "first";
  let refreshes = 0;
  const client = createApiClient({
    baseUrl: "https://example.test",
    sessionKey: () => session,
    accessToken: () => session + "-token",
    refresh: async () => {
      refreshes += 1;
      return session + "-token";
    },
    fetcher: async () => {
      session = "second";
      return new Response(null, { status: 401 });
    },
  });
  await assert.rejects(
    client.request("/v1/test", readNoContent, { authenticated: true }),
    (error: unknown) => error instanceof ApiError && error.status === 401,
  );
  assert.equal(refreshes, 0);
});

void test("a protected response is discarded if the account changes while its body loads", async () => {
  let session = "first";
  class DelayedResponse extends Response {
    override async json() {
      await Promise.resolve();
      session = "second";
      return { account: "first" };
    }
  }
  const client = createApiClient({
    baseUrl: "https://example.test",
    sessionKey: () => session,
    accessToken: () => session + "-token",
    fetcher: async () => new DelayedResponse(),
  });
  await assert.rejects(
    client.request("/v1/test", (body) => body, { authenticated: true }),
    (error: unknown) => error instanceof ApiError && error.status === 401,
  );
});
