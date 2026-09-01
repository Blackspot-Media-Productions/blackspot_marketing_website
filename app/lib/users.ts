import { ObjectId, type WithId } from "mongodb";
import type { AdminSession, TeamMember, UserDocument } from "./types";
import { userPermissions, userRole, userStatus } from "./access";
import { usersCollection } from "./mongo";

export function toAdminSession(user: WithId<UserDocument>): AdminSession {
  return {
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    position: user.position || "",
    role: userRole(user),
    permissions: userPermissions(user),
  };
}

export function toTeamMember(user: WithId<UserDocument>): TeamMember {
  const role = userRole(user);
  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    position: user.position || "",
    role,
    permissions: role === "super_admin" ? [] : userPermissions(user),
    status: userStatus(user),
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getUserById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const users = await usersCollection();
  return users.findOne({ _id: new ObjectId(id) });
}

export async function getUserByEmail(email: string) {
  const users = await usersCollection();
  return users.findOne({ email: email.trim().toLowerCase() });
}

export async function listTeamMembers() {
  const users = await usersCollection();
  const docs = await users.find({}).sort({ createdAt: 1 }).toArray();
  return docs
    .map(toTeamMember)
    .sort((a, b) => {
      if (a.role !== b.role) return a.role === "super_admin" ? -1 : 1;
      if (a.status !== b.status) {
        const order = { active: 0, pending: 1, revoked: 2 };
        return order[a.status] - order[b.status];
      }
      return a.name.localeCompare(b.name) || a.email.localeCompare(b.email);
    });
}

export async function countActiveSuperAdmins() {
  const users = await usersCollection();
  return users.countDocuments({
    $and: [
      { $or: [{ role: "super_admin" }, { role: { $exists: false } }] },
      { $or: [{ status: "active" }, { status: { $exists: false } }] },
    ],
  });
}

export async function isLastActiveSuperAdmin(user: WithId<UserDocument>) {
  if (userRole(user) !== "super_admin" || userStatus(user) !== "active") return false;
  return (await countActiveSuperAdmins()) <= 1;
}
