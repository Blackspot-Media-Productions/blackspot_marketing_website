import { ObjectId, type WithId } from "mongodb";
import type { AdminSession, UserDocument } from "./types";
import { usersCollection } from "./mongo";

export function toAdminSession(user: WithId<UserDocument>): AdminSession {
  return {
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    position: user.position || "",
  };
}

export async function getUserById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const users = await usersCollection();
  return users.findOne({ _id: new ObjectId(id) });
}
