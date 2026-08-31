import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { requireAdminApi, setSessionCookie } from "../../../lib/auth";
import { usersCollection } from "../../../lib/mongo";
import { getUserById, toAdminSession } from "../../../lib/users";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const users = await usersCollection();
    const user = await users.findOne({ email });
    if (!user || !(await compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await setSessionCookie(toAdminSession(user));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Sign in is temporarily unavailable. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  const user = await getUserById(session.sub);
  return NextResponse.json({ user: user ? toAdminSession(user) : session });
}
