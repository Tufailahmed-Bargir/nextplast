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

/** Household / shop routes that belong to the USER shell only. */
const USER_SHELL_PREFIXES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/notifications",
  "/search",
  "/history",
  "/impact",
  "/leaderboard",
  "/sell",
  "/listings",
  "/wallet",
  "/ai",
  "/cart",
  "/wishlist",
  "/checkout",
  "/orders",
] as const;

/** Shopping surfaces — collectors/recyclers should not enter these. */
const SHOP_PREFIXES = [
  "/marketplace",
  "/cart",
  "/wishlist",
  "/checkout",
  "/orders",
] as const;

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

function matchesAnyPrefix(
  pathname: string,
  prefixes: readonly string[],
): boolean {
  return prefixes.some((p) => startsWithPath(pathname, p));
}

/**
 * Keep staff roles inside their own app shell.
 * /profile maps to the role-specific profile when available.
 */
function staffShellRedirect(
  role: Role,
  pathname: string,
): string | null {
  const hitsUserShell = matchesAnyPrefix(pathname, USER_SHELL_PREFIXES);
  const hitsShop = matchesAnyPrefix(pathname, SHOP_PREFIXES);

  if (role === UserRole.COLLECTOR) {
    if (startsWithPath(pathname, "/profile")) return "/collector/profile";
    if (hitsUserShell || hitsShop) return "/collector";
    return null;
  }

  if (role === UserRole.RECYCLER) {
    if (startsWithPath(pathname, "/profile")) return "/recycler/profile";
    if (hitsUserShell || hitsShop) return "/recycler";
    return null;
  }

  if (role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) {
    if (hitsUserShell || hitsShop) return "/admin";
    return null;
  }

  return null;
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

    // Marketplace is public for guests/users, but staff stay in their shell.
    if (isAuthenticated && startsWithPath(pathname, "/marketplace")) {
      const staffHome = staffShellRedirect(role, pathname);
      if (staffHome) {
        return NextResponse.redirect(new URL(staffHome, request.url));
      }
      if (!canAccess(role, "marketplace")) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Staff roles must not land in the user/shop shell.
  const staffHome = staffShellRedirect(role, pathname);
  if (staffHome) {
    return NextResponse.redirect(new URL(staffHome, request.url));
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
