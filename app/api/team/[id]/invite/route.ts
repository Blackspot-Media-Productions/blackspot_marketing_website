import { NextResponse } from "next/server";
import { isSuperAdmin, requireAdminApi } from "../../../../lib/auth";
import { createInviteCredentials, inviteUrlFromRequest } from "../../../../lib/invite";
import { inviteSet } from "../../../../lib/team";
import { getUserById, toTeamMember } from "../../../../lib/users";
import { usersCollection } from "../../../../lib/mongo";
import { sanitizePermissions, userStatus } from "../../../../lib/access";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "You do not have permission to manage the team" }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await getUserById(id);
  if (!existing) return NextResponse.json({ error: "Team member not found" }, { status: 404 });

  const status = userStatus(existing);
  if (status === "active") {
    return NextResponse.json({ error: "This person already has an account. Revoke access first to send a new invite." }, { status: 409 });
  }

  const invite = createInviteCredentials();
  const users = await usersCollection();
  await users.updateOne(
    { _id: existing._id },
    {
      $set: inviteSet({
        role: existing.role === "member" ? "member" : "super_admin",
        permissions: existing.role === "member" ? sanitizePermissions(existing.permissions) : [],
        inviteTokenHash: invite.inviteTokenHash,
        inviteExpiresAt: invite.inviteExpiresAt,
        invitedBy: session.sub,
      }),
      $unset: { passwordHash: "" },
    },
  );
  const updated = await users.findOne({ _id: existing._id });
  if (!updated) return NextResponse.json({ error: "Could not create invite link" }, { status: 500 });

  return NextResponse.json({
    member: toTeamMember(updated),
    inviteUrl: inviteUrlFromRequest(request, invite.token),
  });
}
