import {
  UserRole,
  type UserRole as Role,
  ADMIN_ROLES,
} from "@/constants/roles";

/**
 * Route permission map for RBAC.
 */
export const rolePermissions = {
  dashboard: [UserRole.USER, UserRole.SELLER, ...ADMIN_ROLES],
  sell: [UserRole.USER, UserRole.SELLER, ...ADMIN_ROLES],
  wallet: [UserRole.USER, UserRole.SELLER, ...ADMIN_ROLES],
  marketplace: [UserRole.USER, UserRole.SELLER, ...ADMIN_ROLES],
  collector: [UserRole.COLLECTOR, ...ADMIN_ROLES],
  admin: [...ADMIN_ROLES],
  recyclerOps: [UserRole.RECYCLER, ...ADMIN_ROLES],
} as const satisfies Record<string, readonly Role[]>;

export type PermissionKey = keyof typeof rolePermissions;

export function canAccess(
  role: Role,
  permission: PermissionKey,
): boolean {
  return (rolePermissions[permission] as readonly Role[]).includes(role);
}
