import { NextResponse } from "next/server";
import { hasPermission, requireAdminApi } from "../../../lib/auth";
import { isAllowedUpload, presignUpload, uploadKey } from "../../../lib/r2";

export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session, "content.write")) {
    return NextResponse.json({ error: "You do not have permission to upload media" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const filename = typeof body?.filename === "string" ? body.filename : "";
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const size = typeof body?.size === "number" ? body.size : 0;

  if (!filename || !contentType || !isAllowedUpload(contentType, size)) {
    return NextResponse.json({ error: "Unsupported file type or size" }, { status: 400 });
  }

  const key = uploadKey(filename, contentType);
  const signed = await presignUpload(key, contentType);
  return NextResponse.json(signed);
}
