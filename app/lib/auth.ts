import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./session";
import type { AdminSession, MemberPermission } from "./types";
import { hasPermission, isSuperAdmin, userStatus } from "./access";
import { getUserById, toAdminSession } from "./users";

export { SESSION_COOKIE, verifySession } from "./session";
export { hasPermission, isSuperAdmin } from "./access";

export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload) return null;
  const user = await getUserById(payload.sub);
  if (!user || userStatus(user) !== "active") return null;
  return toAdminSession(user);
}

export async function setSessionCookie(session: AdminSession) {
  const token = await signSession(session);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    await clearSessionCookie();
    redirect("/admin/login");
  }
  return session;
}

export async function requireAdminApi(): Promise<AdminSession | null> {
  return getSession();
}

export async function requireSuperAdmin(): Promise<AdminSession> {
  const session = await requireAdmin();
  if (!isSuperAdmin(session)) redirect("/admin");
  return session;
}

export async function requirePermission(permission: MemberPermission): Promise<AdminSession> {
  const session = await requireAdmin();
  if (!hasPermission(session, permission)) redirect("/admin");
  return session;
}
