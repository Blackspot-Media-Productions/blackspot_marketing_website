import type { AccessRole, AdminSession, MemberPermission, UserDocument, UserStatus } from "./types";

export const ALL_PERMISSIONS: MemberPermission[] = [
  "content.write",
  "content.publish",
  "content.delete",
];

const PERMISSION_SET = new Set<MemberPermission>(ALL_PERMISSIONS);

export function userRole(user: Pick<UserDocument, "role">): AccessRole {
  return user.role === "member" ? "member" : "super_admin";
}

export function userStatus(user: Pick<UserDocument, "status">): UserStatus {
  if (user.status === "pending" || user.status === "revoked") return user.status;
  return "active";
}

export function sanitizePermissions(value: unknown): MemberPermission[] {
  if (!Array.isArray(value)) return [];
  const unique = new Set<MemberPermission>();
  for (const item of value) {
    if (typeof item === "string" && PERMISSION_SET.has(item as MemberPermission)) {
      unique.add(item as MemberPermission);
    }
  }
  return ALL_PERMISSIONS.filter((permission) => unique.has(permission));
}

export function userPermissions(user: Pick<UserDocument, "role" | "permissions">): MemberPermission[] {
  if (userRole(user) === "super_admin") return [...ALL_PERMISSIONS];
  return sanitizePermissions(user.permissions);
}

export function isSuperAdmin(session: Pick<AdminSession, "role"> | null | undefined): boolean {
  return session?.role === "super_admin";
}

export function hasPermission(
  session: Pick<AdminSession, "role" | "permissions"> | null | undefined,
  permission: MemberPermission,
): boolean {
  if (!session) return false;
  if (session.role === "super_admin") return true;
  return session.permissions.includes(permission);
}

export function permissionLabel(permission: MemberPermission): string {
  if (permission === "content.write") return "Create & edit";
  if (permission === "content.publish") return "Publish";
  return "Delete";
}
