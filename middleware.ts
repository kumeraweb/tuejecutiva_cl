import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "admin_secret";

function hasValidSecret(request: NextRequest, adminSecret: string) {
  const headerSecret = request.headers.get("x-admin-secret");
  const cookieSecret = request.cookies.get(ADMIN_COOKIE)?.value;

  if (headerSecret === adminSecret || cookieSecret === adminSecret) {
    return { authorized: true, response: null as NextResponse | null };
  }

  if (process.env.NODE_ENV !== "production") {
    const querySecret = request.nextUrl.searchParams.get("admin");
    if (querySecret === adminSecret) {
      const response = NextResponse.next();
      response.cookies.set(ADMIN_COOKIE, adminSecret, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      return { authorized: true, response };
    }
  }

  return { authorized: false, response: null as NextResponse | null };
}

export function middleware(request: NextRequest) {
  // Admin protection: requires ADMIN_SECRET via header/cookie; in dev it can be seeded via ?admin=SECRET.
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { authorized, response } = hasValidSecret(request, adminSecret);
  if (!authorized) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return response ?? NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
