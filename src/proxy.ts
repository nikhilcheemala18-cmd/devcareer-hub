import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * Gates every /admin/* route. /admin/login is always reachable — the login
 * page itself redirects an already-authenticated admin to /admin, so that
 * "already logged in" redirect only lives in one place.
 *
 * This is the outer layer of defense; requireAdmin() is also called inside
 * each protected page/action as a second, independent check (see the Next.js
 * docs' own warning that a matcher change can silently drop proxy coverage).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  if (!session || session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
