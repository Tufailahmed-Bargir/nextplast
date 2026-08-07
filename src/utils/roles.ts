import {
  ADMIN_ROLES,
  UserRole,
  type UserRole as Role,
} from "@/constants/roles";

/**
 * Role-based access control utilities.
 */

export function isAdmin(role: Role): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

export function hasAnyRole(userRole: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(userRole);
}

/** Default landing path after login based on role */
export function getRoleHomePath(role: Role): string {
  switch (role) {
    case UserRole.ADMIN:
    case UserRole.SUPER_ADMIN:
      return "/admin";
    case UserRole.COLLECTOR:
      return "/collector";
    case UserRole.RECYCLER:
      return "/recycler";
    case UserRole.SELLER:
      return "/marketplace";
    case UserRole.USER:
    default:
      return "/dashboard";
  }
}
