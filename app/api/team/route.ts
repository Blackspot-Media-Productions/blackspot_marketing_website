import { NextResponse } from "next/server";
import { isSuperAdmin, requireAdminApi } from "../../lib/auth";
import { createInviteCredentials, inviteUrlFromRequest } from "../../lib/invite";
import { displayNameFromEmail, inviteSet, parseAccess, parseEmail } from "../../lib/team";
import type { UserDocument } from "../../lib/types";
import { getUserByEmail, listTeamMembers, toTeamMember } from "../../lib/users";
import { usersCollection } from "../../lib/mongo";

async function requireTeamAdmin() {
  const session = await requireAdminApi();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isSuperAdmin(session)) {
    return { error: NextResponse.json({ error: "You do not have permission to manage the team" }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const auth = await requireTeamAdmin();
  if ("error" in auth) return auth.error;
  return NextResponse.json({ members: await listTeamMembers() });
}

export async function POST(request: Request) {
  const auth = await requireTeamAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const email = parseEmail(body?.email);
  if (!email) return NextResponse.json({ error: "A valid email is required" }, { status: 400 });

  const access = parseAccess(body);
  if ("error" in access) return NextResponse.json(access, { status: 400 });

  const existing = await getUserByEmail(email);
  if (existing && existing.status !== "pending" && existing.status !== "revoked") {
    return NextResponse.json({ error: "That person is already on the team" }, { status: 409 });
  }

  const invite = createInviteCredentials();
  const users = await usersCollection();
  const providedName = typeof body?.name === "string" ? body.name.trim() : "";
  const name = providedName || existing?.name || displayNameFromEmail(email);
  const fields = inviteSet({
    name,
    role: access.role,
    permissions: access.permissions,
    inviteTokenHash: invite.inviteTokenHash,
    inviteExpiresAt: invite.inviteExpiresAt,
    invitedBy: auth.session.sub,
  });

  if (existing) {
    await users.updateOne({ _id: existing._id }, { $set: fields, $unset: { passwordHash: "" } });
    const updated = await users.findOne({ _id: existing._id });
    if (!updated) return NextResponse.json({ error: "Could not send invite" }, { status: 500 });
    return NextResponse.json({
      member: toTeamMember(updated),
      inviteUrl: inviteUrlFromRequest(request, invite.token),
    });
  }

  const doc: UserDocument = {
    email,
    name,
    role: access.role,
    permissions: access.permissions,
    status: "pending",
    inviteTokenHash: invite.inviteTokenHash,
    inviteExpiresAt: invite.inviteExpiresAt,
    invitedBy: auth.session.sub,
    createdAt: new Date(),
  };
  const result = await users.insertOne(doc);
  const created = await users.findOne({ _id: result.insertedId });
  if (!created) return NextResponse.json({ error: "Could not send invite" }, { status: 500 });

  return NextResponse.json(
    {
      member: toTeamMember(created),
      inviteUrl: inviteUrlFromRequest(request, invite.token),
    },
    { status: 201 },
  );
}
