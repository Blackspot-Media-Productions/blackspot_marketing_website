import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { hasPermission, requireAdminApi } from "../../../lib/auth";
import { teamMembersCollection } from "../../../lib/mongo";
import { revalidateMember } from "../../../lib/revalidate";
import {
  getMemberById,
  getMemberByName,
  memberFromInput,
  serializeMember,
} from "../../../lib/team-members";
import { parseTeamMemberPayload } from "../../../lib/validate-team-members";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAdminApi();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const member = await getMemberById(id);
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ member });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdminApi();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session, "member.write")) {
    return NextResponse.json(
      { error: "You do not have permission to edit a team member" },
      { status: 403 },
    );
  }
  const { id } = await context.params;
  const existing = await getMemberById(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = parseTeamMemberPayload(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json(parsed, { status: 400 });
  if (
    parsed.status === "published" &&
    existing.status !== "published" &&
    !hasPermission(session, "member.publish")
  ) {
    return NextResponse.json(
      { error: "You do not have permission to publish" },
      { status: 403 },
    );
  }

  const nameOwner = await getMemberByName(parsed.name);
  if (nameOwner && nameOwner._id !== existing._id) {
    return NextResponse.json(
      { error: "A post with this slug already exists" },
      { status: 409 },
    );
  }

  const collection = await teamMembersCollection();
  const next = memberFromInput(parsed, existing);
  await collection.updateOne(
    { _id: new ObjectId(existing._id) },
    { $set: next },
  );
  const updated = await collection.findOne({ _id: new ObjectId(existing._id) });
  if (!updated)
    return NextResponse.json(
      { error: "Could not update team member" },
      { status: 500 },
    );

  const member = serializeMember(updated);
  revalidateMember();
  revalidateMember();
  return NextResponse.json({ member });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminApi();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session, "member.delete")) {
    return NextResponse.json(
      { error: "You do not have permission to delete a team member" },
      { status: 403 },
    );
  }
  const { id } = await context.params;
  const existing = await getMemberById(id);
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const collection = await teamMembersCollection();
  await collection.deleteOne({ _id: new ObjectId(existing._id) });
  revalidateMember();
  return NextResponse.json({ ok: true });
}
