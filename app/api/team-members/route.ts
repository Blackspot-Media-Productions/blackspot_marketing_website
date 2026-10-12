import { NextResponse } from "next/server";
import { hasPermission, requireAdminApi } from "../../lib/auth";
import { teamMembersCollection } from "../../lib/mongo";
import { revalidateMember } from "../../lib/revalidate";
import {
  getMemberByName,
  listTeamMembers,
  memberFromInput,
  serializeMember,
} from "../../lib/team-members";
import { parseTeamMemberPayload } from "../../lib/validate-team-members";

export async function GET(request: Request) {
  const session = await requireAdminApi();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const members = await listTeamMembers({
    q: searchParams.get("q") || undefined,
  });
  return NextResponse.json({ members });
}

export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session, "member.write")) {
    return NextResponse.json(
      { error: "You do not have permission to add a team member" },
      { status: 403 },
    );
  }

  const parsed = parseTeamMemberPayload(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json(parsed, { status: 400 });
  if (
    parsed.status === "published" &&
    !hasPermission(session, "member.publish")
  ) {
    return NextResponse.json(
      { error: "You do not have permission to publish" },
      { status: 403 },
    );
  }

  const existing = await getMemberByName(parsed.name);
  if (existing)
    return NextResponse.json(
      { error: "A post with this slug already exists" },
      { status: 409 },
    );

  const collection = await teamMembersCollection();
  const doc = memberFromInput(parsed);
  const result = await collection.insertOne(doc);
  const created = await collection.findOne({ _id: result.insertedId });
  if (!created)
    return NextResponse.json(
      { error: "Could not add member" },
      { status: 500 },
    );

  const member = serializeMember(created);
  revalidateMember();
  return NextResponse.json({ member }, { status: 201 });
}
