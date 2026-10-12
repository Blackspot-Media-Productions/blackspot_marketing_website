import { PostStatus, TeamMenberInput } from "./types";

const STATUSES = new Set<PostStatus>(["draft", "review", "published"]);

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

export function parseTeamMemberPayload(
  body: unknown,
): { error: string } | TeamMenberInput {
  if (!body || typeof body !== "object") return { error: "Invalid payload" };
  const data = body as Record<string, unknown>;
  const status = (asString(data.status) || "draft") as PostStatus;
  if (!STATUSES.has(status)) return { error: "Invalid status" };

  const name = asString(data.name);
  if (!name) return { error: "Name is required" };
  const role = asString(data.role);
  if (!role && status !== "draft") return { error: "Role is required" };
  const photo = asString(data.photo);
  if (!photo && status !== "draft") return { error: "Photo is required" };

  return {
    name,
    role,
    status,
    email: asString(data.email),
    isActive: asBoolean(data.isActive),
    photo: asString(data.photo),
  };
}
