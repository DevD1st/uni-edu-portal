import { studentConfig } from "../../../features/auth/server/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "cache-control": "no-store" };
  try {
    const api = await fetch(new URL("/health/ready", studentConfig().api), {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (api.ok) return Response.json({ status: "ok" }, { headers });
  } catch {
    // Readiness is public; connection strings and upstream errors stay on the server.
  }
  return Response.json({ status: "unavailable" }, { status: 503, headers });
}
