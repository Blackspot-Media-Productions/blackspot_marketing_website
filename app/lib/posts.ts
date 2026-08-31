import type { WithId } from "mongodb";
import { ObjectId } from "mongodb";
import { postsCollection } from "./mongo";
import type { BlogPost, Post, PostDocument, PostInput, Project } from "./types";
import { formatDisplayDate } from "./format";

export function serializePost(doc: WithId<PostDocument>): Post {
  return {
    _id: doc._id.toString(),
    kind: doc.kind,
    status: doc.status,
    slug: doc.slug,
    title: doc.title,
    summary: doc.summary,
    cover: doc.cover,
    seoTitle: doc.seoTitle,
    seoDescription: doc.seoDescription,
    category: doc.category,
    body: doc.body,
    read: doc.read,
    client: doc.client,
    type: doc.type,
    year: doc.year,
    services: doc.services,
    images: doc.images,
    video: doc.video,
    challenge: doc.challenge,
    solution: doc.solution,
    outcome: doc.outcome,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    publishedAt: doc.publishedAt?.toISOString(),
  };
}

export function toProject(post: Post): Project {
  return {
    slug: post.slug,
    title: post.title,
    client: post.client || "",
    category: post.category || "",
    type: post.type || "image",
    cover: post.cover,
    year: post.year || "",
    summary: post.summary,
    images: post.images,
    video: post.video,
    challenge: post.challenge,
    solution: post.solution,
    outcome: post.outcome,
    services: post.services || [],
  };
}

export function toBlogPost(post: Post): BlogPost {
  return {
    slug: post.slug,
    title: post.title,
    category: post.category || "",
    date: formatDisplayDate(post.publishedAt || post.createdAt),
    read: post.read || "5 min read",
    excerpt: post.summary,
    cover: post.cover,
    body: post.body,
  };
}

export async function listPosts(filter: { kind?: string; status?: string; q?: string } = {}) {
  const collection = await postsCollection();
  const query: Record<string, unknown> = {};
  if (filter.kind === "blog" || filter.kind === "proof") query.kind = filter.kind;
  if (filter.status === "draft" || filter.status === "review" || filter.status === "published") {
    query.status = filter.status;
  }
  if (filter.q) {
    query.$or = [
      { title: { $regex: filter.q, $options: "i" } },
      { slug: { $regex: filter.q, $options: "i" } },
      { client: { $regex: filter.q, $options: "i" } },
      { category: { $regex: filter.q, $options: "i" } },
    ];
  }
  const docs = await collection.find(query).sort({ updatedAt: -1 }).toArray();
  return docs.map(serializePost);
}

export async function getPostById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const collection = await postsCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? serializePost(doc) : null;
}

export async function getPostBySlug(slug: string, kind?: "blog" | "proof") {
  const collection = await postsCollection();
  const doc = await collection.findOne(kind ? { slug, kind } : { slug });
  return doc ? serializePost(doc) : null;
}

export async function getPublishedProjects(): Promise<Project[]> {
  try {
    const collection = await postsCollection();
    const docs = await collection
      .find({ kind: "proof", status: "published" })
      .sort({ publishedAt: -1, updatedAt: -1 })
      .toArray();
    return docs.map((doc) => toProject(serializePost(doc)));
  } catch {
    return [];
  }
}

export async function getPublishedProject(slug: string): Promise<Project | null> {
  try {
    const collection = await postsCollection();
    const doc = await collection.findOne({ kind: "proof", status: "published", slug });
    return doc ? toProject(serializePost(doc)) : null;
  } catch {
    return null;
  }
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const collection = await postsCollection();
    const docs = await collection
      .find({ kind: "blog", status: "published" })
      .sort({ publishedAt: -1, updatedAt: -1 })
      .toArray();
    return docs.map((doc) => toBlogPost(serializePost(doc)));
  } catch {
    return [];
  }
}

export async function getPublishedBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const collection = await postsCollection();
    const doc = await collection.findOne({ kind: "blog", status: "published", slug });
    return doc ? toBlogPost(serializePost(doc)) : null;
  } catch {
    return null;
  }
}

export function postFromInput(input: PostInput, existing?: Post): PostDocument {
  const now = new Date();
  const status = input.status;
  const wasPublished = existing?.status === "published";
  const publishing = status === "published" && !wasPublished;
  return {
    kind: input.kind,
    status,
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    cover: input.cover,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    category: input.category,
    body: input.body,
    read: input.read,
    client: input.client,
    type: input.type,
    year: input.year,
    services: input.services,
    images: input.images,
    video: input.video,
    challenge: input.challenge,
    solution: input.solution,
    outcome: input.outcome,
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
