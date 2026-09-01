import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import type { AdminSession } from "./types";

export const SESSION_COOKIE = "bs_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(session: AdminSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      position: typeof payload.position === "string" ? payload.position : "",
      role: payload.role === "member" ? "member" : "super_admin",
      permissions: Array.isArray(payload.permissions)
        ? payload.permissions.filter((item): item is AdminSession["permissions"][number] =>
            item === "content.write" || item === "content.publish" || item === "content.delete",
          )
        : [],
    };
  } catch {
    return null;
  }
}
