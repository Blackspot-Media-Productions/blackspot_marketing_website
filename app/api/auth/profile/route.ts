import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { requireAdminApi, setSessionCookie } from "../../../lib/auth";
import { usersCollection } from "../../../lib/mongo";
import { toAdminSession } from "../../../lib/users";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(request: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = asString(body?.name);
  const position = asString(body?.position);
  const email = asString(body?.email).toLowerCase();
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (newPassword && newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }
  if (newPassword && !currentPassword) {
    return NextResponse.json({ error: "Current password is required to set a new one" }, { status: 400 });
  }

  const users = await usersCollection();
  const existing = await users.findOne({ _id: new ObjectId(session.sub) });
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (email !== existing.email) {
    const taken = await users.findOne({ email });
    if (taken) return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
  }

  const next: { name: string; position: string; email: string; updatedAt: Date; passwordHash?: string } = {
    name,
    position,
    email,
    updatedAt: new Date(),
  };

  if (newPassword) {
    if (!existing.passwordHash || !(await compare(currentPassword, existing.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }
    next.passwordHash = await hash(newPassword, 12);
  }

  await users.updateOne({ _id: existing._id }, { $set: next });
  const updated = await users.findOne({ _id: existing._id });
  if (!updated) return NextResponse.json({ error: "Could not update profile" }, { status: 500 });

  const user = toAdminSession(updated);
  await setSessionCookie(user);
  return NextResponse.json({ user });
}
