/**
 * Application roles for RBAC.
 * Priority: Prompt-defined roles (extends documentation roles).
 */
export const UserRole = {
  USER: "USER",
  COLLECTOR: "COLLECTOR",
  RECYCLER: "RECYCLER",
  SELLER: "SELLER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ADMIN_ROLES: readonly UserRole[] = [
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  USER: "User",
  COLLECTOR: "Collector",
  RECYCLER: "Recycler",
  SELLER: "Seller",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};
