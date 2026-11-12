import assert from "node:assert/strict";
import test from "node:test";

void test("student liveness stays healthy without a reachable or configured API", async (context) => {
  const previousApi = process.env["STUDENT_API_URL"];
  const previousApp = process.env["STUDENT_APP_ORIGIN"];
  const fetch = context.mock.method(globalThis, "fetch", async () => {
    throw new Error("The upstream API is unavailable.");
  });

  try {
    process.env["STUDENT_API_URL"] = "not-an-origin";
    process.env["STUDENT_APP_ORIGIN"] = "not-an-origin";
    const { GET } = await import("../src/app/health/live/route.ts");
    for (const api of ["not-an-origin", "http://127.0.0.1:1"]) {
      process.env["STUDENT_API_URL"] = api;
      const response = GET();
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.deepEqual(await response.json(), { status: "ok" });
    }
    assert.equal(fetch.mock.callCount(), 0);
  } finally {
    if (previousApi === undefined) delete process.env["STUDENT_API_URL"];
    else process.env["STUDENT_API_URL"] = previousApi;
    if (previousApp === undefined) delete process.env["STUDENT_APP_ORIGIN"];
    else process.env["STUDENT_APP_ORIGIN"] = previousApp;
  }
});
