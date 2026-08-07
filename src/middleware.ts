import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole, type UserRole as Role } from "@/constants/roles";
import { getRoleHomePath } from "@/utils/roles";
import { canAccess } from "@/features/auth/services/permissions";

/**
 * Authentication + RBAC middleware.
 * JWT validation on the edge; role-based redirects for protected groups.
 */

const publicExact = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/unauthorized",
]);

const publicPrefixes = ["/api/auth", "/api/health", "/marketplace"];

const isProd = process.env.NODE_ENV === "production";

function isPublic(pathname: string): boolean {
  if (publicExact.has(pathname)) return true;
  return publicPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function startsWithPath(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: isProd,
    cookieName: isProd
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  });

  const isAuthenticated = Boolean(
    token &&
      !token.error &&
      (token.sub || token.id),
  );
  const role = (token?.role as Role | undefined) ?? UserRole.USER;

  if (isPublic(pathname)) {
    if (
      isAuthenticated &&
      (pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/forgot-password")
    ) {
      return NextResponse.redirect(
        new URL(getRoleHomePath(role), request.url),
      );
    }
    if (
      isAuthenticated &&
      startsWithPath(pathname, "/marketplace") &&
      !canAccess(role, "marketplace")
    ) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (startsWithPath(pathname, "/admin") && !canAccess(role, "admin")) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (
    startsWithPath(pathname, "/collector") &&
    !canAccess(role, "collector")
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (startsWithPath(pathname, "/sell") && !canAccess(role, "sell")) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (startsWithPath(pathname, "/listings") && !canAccess(role, "sell")) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (
    startsWithPath(pathname, "/marketplace") &&
    isAuthenticated &&
    !canAccess(role, "marketplace")
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (startsWithPath(pathname, "/cart") && !canAccess(role, "marketplace")) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (
    startsWithPath(pathname, "/checkout") &&
    !canAccess(role, "marketplace")
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (
    startsWithPath(pathname, "/wishlist") &&
    !canAccess(role, "marketplace")
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (startsWithPath(pathname, "/orders") && !canAccess(role, "marketplace")) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (startsWithPath(pathname, "/wallet") && !canAccess(role, "wallet")) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (
    startsWithPath(pathname, "/dashboard") &&
    !canAccess(role, "dashboard")
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Collectors / recyclers land on role apps, not the household dashboard.
  if (pathname === "/dashboard" && role === UserRole.COLLECTOR) {
    return NextResponse.redirect(new URL("/collector", request.url));
  }
  if (pathname === "/dashboard" && role === UserRole.RECYCLER) {
    return NextResponse.redirect(new URL("/recycler", request.url));
  }

  if (
    startsWithPath(pathname, "/recycler") &&
    !canAccess(role, "recyclerOps")
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
