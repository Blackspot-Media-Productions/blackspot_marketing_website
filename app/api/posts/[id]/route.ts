import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { requireAdminApi } from "../../../lib/auth";
import { getPostById, getPostBySlug, postFromInput, serializePost } from "../../../lib/posts";
import { postsCollection } from "../../../lib/mongo";
import { revalidateContent } from "../../../lib/revalidate";
import { parsePostPayload } from "../../../lib/validate-post";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const post = await getPostById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const existing = await getPostById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = parsePostPayload(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json(parsed, { status: 400 });

  const slugOwner = await getPostBySlug(parsed.slug);
  if (slugOwner && slugOwner._id !== existing._id) {
    return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
  }

  const collection = await postsCollection();
  const next = postFromInput(parsed, existing);
  await collection.updateOne({ _id: new ObjectId(existing._id) }, { $set: next });
  const updated = await collection.findOne({ _id: new ObjectId(existing._id) });
  if (!updated) return NextResponse.json({ error: "Could not update post" }, { status: 500 });

  const post = serializePost(updated);
  revalidateContent(existing);
  revalidateContent(post);
  return NextResponse.json({ post });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const existing = await getPostById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const collection = await postsCollection();
  await collection.deleteOne({ _id: new ObjectId(existing._id) });
  revalidateContent(existing);
  return NextResponse.json({ ok: true });
}
