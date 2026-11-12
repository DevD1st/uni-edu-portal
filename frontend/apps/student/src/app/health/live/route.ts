export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  // A sleeping API affects readiness, not whether this portal process is alive.
  return Response.json({ status: "ok" }, { headers: { "cache-control": "no-store" } });
}
