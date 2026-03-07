import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Session cookie name used by NextAuth v5 (Auth.js) with JWT strategy.
// Do NOT import from @/lib/auth here — it pulls Prisma + NextAuth into the Edge bundle and exceeds 1 MB.
const SESSION_COOKIE_NAME = "authjs.session-token";

export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has(SESSION_COOKIE_NAME);
  const path = req.nextUrl.pathname;
  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/books") ||
    path.startsWith("/loans") ||
    path.startsWith("/admin");

  if (isProtected && !hasSession) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
