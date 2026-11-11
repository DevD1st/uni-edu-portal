import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  // Overwrite caller input so a renewal returns only to the page being rendered.
  headers.set("x-uemp-student-path", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/overview", "/account", "/registration/:path*", "/results/:path*"],
};
