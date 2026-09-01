import { NextResponse } from "next/server";
import { isSuperAdmin, requireAdminApi } from "../../../lib/auth";
import { asObjectId } from "../../../lib/invite";
import { parseAccess } from "../../../lib/team";
import { getUserById, isLastActiveSuperAdmin, toTeamMember } from "../../../lib/users";
import { usersCollection } from "../../../lib/mongo";
import { userRole, userStatus } from "../../../lib/access";

type RouteContext = { params: Promise<{ id: string }> };

async function requireTeamAdmin() {
  const session = await requireAdminApi();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isSuperAdmin(session)) {
    return { error: NextResponse.json({ error: "You do not have permission to manage the team" }, { status: 403 }) };
  }
  return { session };
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireTeamAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const existing = await getUserById(id);
  if (!existing) return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  if (userStatus(existing) === "revoked") {
    return NextResponse.json({ error: "Re-invite this person before changing their rights" }, { status: 409 });
  }

  const access = parseAccess(await request.json().catch(() => null));
  if ("error" in access) return NextResponse.json(access, { status: 400 });

  const demoting = userRole(existing) === "super_admin" && access.role !== "super_admin";
  if (demoting && (await isLastActiveSuperAdmin(existing))) {
    return NextResponse.json({ error: "There must be at least one super admin" }, { status: 409 });
  }

  const users = await usersCollection();
  await users.updateOne(
    { _id: existing._id },
    {
      $set: {
        role: access.role,
        permissions: access.permissions,
        updatedAt: new Date(),
      },
    },
  );
  const updated = await users.findOne({ _id: existing._id });
  if (!updated) return NextResponse.json({ error: "Could not update access" }, { status: 500 });
  return NextResponse.json({ member: toTeamMember(updated) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireTeamAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const objectId = asObjectId(id);
  if (!objectId) return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  if (id === auth.session.sub) {
    return NextResponse.json({ error: "You cannot revoke your own access" }, { status: 409 });
  }

  const existing = await getUserById(id);
  if (!existing) return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  if (userStatus(existing) === "revoked") {
    return NextResponse.json({ member: toTeamMember(existing) });
  }
  if (await isLastActiveSuperAdmin(existing)) {
    return NextResponse.json({ error: "There must be at least one super admin" }, { status: 409 });
  }

  const users = await usersCollection();
  await users.updateOne(
    { _id: existing._id },
    {
      $set: { status: "revoked", updatedAt: new Date() },
      $unset: { inviteTokenHash: "", inviteExpiresAt: "", passwordHash: "" },
    },
  );
  const updated = await users.findOne({ _id: existing._id });
  if (!updated) return NextResponse.json({ error: "Could not revoke access" }, { status: 500 });
  return NextResponse.json({ member: toTeamMember(updated) });
}
