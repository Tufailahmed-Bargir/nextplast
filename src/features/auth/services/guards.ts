import "server-only";

import { auth } from "@/auth";
import { UserRole, type UserRole as Role } from "@/constants/roles";
import { hasAnyRole, isAdmin } from "@/utils/roles";
import type { SessionUser } from "@/types";

export class AuthHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AuthHttpError";
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    role: session.user.role ?? UserRole.USER,
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AuthHttpError("Authentication required", 401, "UNAUTHORIZED");
  }
  return user;
}

export async function requireRoles(
  allowed: readonly Role[],
): Promise<SessionUser> {
  const user = await requireAuth();
  if (!hasAnyRole(user.role, allowed)) {
    throw new AuthHttpError("Insufficient permissions", 403, "FORBIDDEN");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (!isAdmin(user.role)) {
    throw new AuthHttpError("Admin access required", 403, "FORBIDDEN");
  }
  return user;
}

/**
 * Ownership check — resource owner or admin may proceed.
 */
export function assertOwnership(
  user: SessionUser,
  resourceOwnerId: string,
): void {
  if (user.id === resourceOwnerId || isAdmin(user.role)) {
    return;
  }
  throw new AuthHttpError(
    "You do not own this resource",
    403,
    "FORBIDDEN",
  );
}
