import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { setSessionCookie } from "../../../../lib/auth";
import { getInviteByToken } from "../../../../lib/invite";
import { toAdminSession } from "../../../../lib/users";
import { usersCollection } from "../../../../lib/mongo";

type RouteContext = { params: Promise<{ token: string }> };

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const invite = await getInviteByToken(token);
  if (!invite) {
    return NextResponse.json({ error: "This invite is invalid or has expired" }, { status: 404 });
  }
  return NextResponse.json({
    email: invite.email,
    name: invite.name || "",
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const invite = await getInviteByToken(token);
  if (!invite) {
    return NextResponse.json({ error: "This invite is invalid or has expired" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const name = asString(body?.name) || invite.name || invite.email.split("@")[0];
  const password = typeof body?.password === "string" ? body.password : "";
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const users = await usersCollection();
  await users.updateOne(
    { _id: invite._id },
    {
      $set: {
        name,
        passwordHash: await hash(password, 12),
        status: "active",
        updatedAt: new Date(),
      },
      $unset: { inviteTokenHash: "", inviteExpiresAt: "" },
    },
  );
  const updated = await users.findOne({ _id: invite._id });
  if (!updated) return NextResponse.json({ error: "Could not accept invite" }, { status: 500 });

  const user = toAdminSession(updated);
  await setSessionCookie(user);
  return NextResponse.json({ user });
}
