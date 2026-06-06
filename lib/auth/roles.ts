// Generic user roles. Extend `UserRole` to add app-specific roles.
export type UserRole = "USER" | "ADMIN";

export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export const PERMISSIONS = {
  MANAGE_USERS: [ROLES.ADMIN],
  VIEW_ADMIN_DASHBOARD: [ROLES.ADMIN],
  CREATE_RECORD: [ROLES.USER, ROLES.ADMIN],
  VIEW_ALL_RECORDS: [ROLES.ADMIN],
} as const;

export function isAdmin(role?: string | null): boolean {
  return role === ROLES.ADMIN;
}

export function canAccess(
  role: string | undefined | null,
  permission: keyof typeof PERMISSIONS
): boolean {
  if (!role) return false;
  const allowedRoles = PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(role);
}
