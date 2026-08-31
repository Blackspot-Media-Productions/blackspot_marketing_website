import type { PostInput, PostKind, PostStatus, ProjectType } from "./types";
import { slugify } from "./format";

const KINDS = new Set<PostKind>(["blog", "proof"]);
const STATUSES = new Set<PostStatus>(["draft", "review", "published"]);
const TYPES = new Set<ProjectType>(["image", "video", "gallery", "case-study"]);

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => asString(item)).filter(Boolean);
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [] as string[];
}

export function parsePostPayload(body: unknown): { error: string } | PostInput {
  if (!body || typeof body !== "object") return { error: "Invalid payload" };
  const data = body as Record<string, unknown>;
  const kind = asString(data.kind) as PostKind;
  const status = (asString(data.status) || "draft") as PostStatus;
  if (!KINDS.has(kind)) return { error: "Kind must be blog or proof" };
  if (!STATUSES.has(status)) return { error: "Invalid status" };

  const title = asString(data.title);
  if (!title) return { error: "Title is required" };
  const slug = slugify(asString(data.slug) || title);
  if (!slug) return { error: "Slug is required" };

  const type = asString(data.type) as ProjectType;
  if (kind === "proof" && type && !TYPES.has(type)) return { error: "Invalid presentation format" };

  return {
    kind,
    status,
    slug,
    title,
    summary: asString(data.summary),
    cover: asString(data.cover),
    seoTitle: asString(data.seoTitle) || undefined,
    seoDescription: asString(data.seoDescription) || undefined,
    category: asString(data.category) || undefined,
    body: asString(data.body) || undefined,
    read: asString(data.read) || undefined,
    client: asString(data.client) || undefined,
    type: kind === "proof" ? (type || "image") : undefined,
    year: asString(data.year) || undefined,
    services: asStringArray(data.services),
    images: asStringArray(data.images),
    video: asString(data.video) || undefined,
    challenge: asString(data.challenge) || undefined,
    solution: asString(data.solution) || undefined,
    outcome: asString(data.outcome) || undefined,
  };
}
