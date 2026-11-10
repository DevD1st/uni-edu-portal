import "server-only";

function httpOrigin(value: string | undefined, fallback: string, name: string) {
  const url = new URL(value ?? fallback);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error(name + " must be an HTTP origin without credentials or a path.");
  return url;
}

export function studentConfig() {
  const app = httpOrigin(
    process.env["STUDENT_APP_ORIGIN"],
    "http://localhost:3001",
    "STUDENT_APP_ORIGIN",
  );
  const api = httpOrigin(
    process.env["STUDENT_API_URL"],
    "http://localhost:3000",
    "STUDENT_API_URL",
  );
  const redis = new URL(process.env["STUDENT_REDIS_URL"] ?? "redis://127.0.0.1:6380");
  if (!["redis:", "rediss:"].includes(redis.protocol))
    throw new Error("STUDENT_REDIS_URL must use redis or rediss.");
  return { app, api, redis };
}
