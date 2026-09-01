import type { AccessRole, MemberPermission, UserDocument } from "./types";
import { sanitizePermissions } from "./access";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseEmail(value: unknown) {
  const email = asString(value).toLowerCase();
  if (!email || !email.includes("@")) return "";
  return email;
}

export function parseAccess(body: unknown): { error: string } | { role: AccessRole; permissions: MemberPermission[] } {
  if (!body || typeof body !== "object") return { error: "Invalid payload" };
  const data = body as Record<string, unknown>;
  const role = asString(data.role) === "super_admin" ? "super_admin" : asString(data.role) === "member" ? "member" : "";
  if (!role) return { error: "Role must be super_admin or member" };
  return {
    role,
    permissions: role === "super_admin" ? [] : sanitizePermissions(data.permissions),
  };
}

export function displayNameFromEmail(email: string, name?: string) {
  const trimmed = asString(name);
  if (trimmed) return trimmed;
  const local = email.split("@")[0] || "Invited member";
  return local;
}

export function inviteSet(user: Pick<UserDocument, "role" | "permissions"> & {
  inviteTokenHash: string;
  inviteExpiresAt: Date;
  invitedBy: string;
  name?: string;
}): Partial<UserDocument> {
  return {
    ...(user.name ? { name: user.name } : {}),
    role: user.role,
    permissions: user.permissions,
    status: "pending",
    inviteTokenHash: user.inviteTokenHash,
    inviteExpiresAt: user.inviteExpiresAt,
    invitedBy: user.invitedBy,
    updatedAt: new Date(),
  };
}
