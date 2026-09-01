import { createHash, randomBytes } from "node:crypto";
import { ObjectId, type WithId } from "mongodb";
import type { UserDocument } from "./types";
import { userStatus } from "./access";
import { usersCollection } from "./mongo";

export const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createInviteCredentials() {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    inviteTokenHash: hashInviteToken(token),
    inviteExpiresAt: new Date(Date.now() + INVITE_TTL_MS),
  };
}

export function inviteUrlFromRequest(request: Request, token: string) {
  return new URL(`/admin/invite/${token}`, request.url).toString();
}

export function isInviteExpired(user: Pick<UserDocument, "inviteExpiresAt">) {
  return !user.inviteExpiresAt || user.inviteExpiresAt.getTime() < Date.now();
}

export async function getInviteByToken(token: string): Promise<WithId<UserDocument> | null> {
  if (!token || !/^[a-f0-9]{64}$/i.test(token)) return null;
  const users = await usersCollection();
  const user = await users.findOne({ inviteTokenHash: hashInviteToken(token) });
  if (!user || userStatus(user) !== "pending" || isInviteExpired(user)) return null;
  return user;
}

export function asObjectId(id: string) {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}
