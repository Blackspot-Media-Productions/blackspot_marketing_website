import { NextResponse } from "next/server";
import { hasPermission, requireAdminApi } from "../../lib/auth";
import { getPostBySlug, listPosts, postFromInput, serializePost } from "../../lib/posts";
import { postsCollection } from "../../lib/mongo";
import { revalidateContent } from "../../lib/revalidate";
import { parsePostPayload } from "../../lib/validate-post";

export async function GET(request: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const posts = await listPosts({
    kind: searchParams.get("kind") || undefined,
    status: searchParams.get("status") || undefined,
    q: searchParams.get("q") || undefined,
  });
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session, "content.write")) {
    return NextResponse.json({ error: "You do not have permission to create content" }, { status: 403 });
  }

  const parsed = parsePostPayload(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json(parsed, { status: 400 });
  if (parsed.status === "published" && !hasPermission(session, "content.publish")) {
    return NextResponse.json({ error: "You do not have permission to publish" }, { status: 403 });
  }

  const existing = await getPostBySlug(parsed.slug);
  if (existing) return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });

  const collection = await postsCollection();
  const doc = postFromInput(parsed);
  const result = await collection.insertOne(doc);
  const created = await collection.findOne({ _id: result.insertedId });
  if (!created) return NextResponse.json({ error: "Could not create post" }, { status: 500 });

  const post = serializePost(created);
  revalidateContent(post);
  return NextResponse.json({ post }, { status: 201 });
}
