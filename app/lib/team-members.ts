import { ObjectId, WithId } from "mongodb";
import { teamMembersCollection } from "./mongo";
import { MemberContent, MemberDocument, TeamMenberInput } from "./types";

export function serializeMember(doc: WithId<MemberDocument>): MemberContent {
  return {
    _id: doc._id.toString(),
    email: doc.email,
    isActive: doc.isActive,
    name: doc.name,
    photo: doc.photo,
    role: doc.role,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    publishedAt: doc.publishedAt?.toISOString(),
  };
}

export async function listTeamMembers(filter: { q?: string } = {}) {
  const collection = await teamMembersCollection();
  const query: Record<string, unknown> = {};
  if (filter.q) {
    query.$or = [
      { name: { $regex: filter.q, $options: "i" } },
      { role: { $regex: filter.q, $options: "i" } },
      { email: { $regex: filter.q, $options: "i" } },
    ];
  }
  const docs = await collection.find(query).sort({ updatedAt: -1 }).toArray();
  return docs.map(serializeMember);
}

export async function getPublishedTeamMembers(): Promise<MemberContent[]> {
  try {
    const collection = await teamMembersCollection();
    const docs = await collection.find({ status: "published" }).toArray();
    return docs.map((doc) => serializeMember(doc));
  } catch {
    return [];
  }
}

export async function getPublishedProject(
  id: string,
): Promise<MemberContent | null> {
  try {
    const collection = await teamMembersCollection();
    const doc = await collection.findOne({
      _id: new ObjectId(id),
      status: "published",
    });
    return doc ? serializeMember(doc) : null;
  } catch {
    return null;
  }
}

export async function getMemberById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const collection = await teamMembersCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? serializeMember(doc) : null;
}

export async function getMemberByName(name: string) {
  const collection = await teamMembersCollection();
  const doc = await collection.findOne({ name });
  return doc ? serializeMember(doc) : null;
}

export function memberFromInput(
  input: TeamMenberInput,
  existing?: MemberContent,
): MemberDocument {
  const now = new Date();
  const status = input.status;
  const wasPublished = existing?.status === "published";
  const publishing = status === "published" && !wasPublished;
  return {
    status,
    name: input.name,
    photo: input.photo,
    email: input.email,
    role: input.role,
    isActive: input.isActive,
    createdAt: existing ? new Date(existing.createdAt) : now,
    updatedAt: now,
    publishedAt: publishing
      ? now
      : status === "published"
        ? existing?.publishedAt
          ? new Date(existing.publishedAt)
          : now
        : existing?.publishedAt
          ? new Date(existing.publishedAt)
          : undefined,
  };
}
