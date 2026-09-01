import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requirePermission } from "../../lib/auth";
import { hasPermission } from "../../lib/access";
import { getPostById } from "../../lib/posts";
import { PostEditor } from "./PostEditor";

export const metadata: Metadata = {
  title: "Create content — Blackspot CMS",
  description: "Create a Blackspot post",
  robots: { index: false, follow: false },
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default async function NewPost({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; type?: string }>;
}) {
  const session = await requirePermission("content.write");
  const params = await searchParams;
  const initial = params.id ? await getPostById(params.id) : null;
  if (params.id && !initial) redirect("/admin");
  return (
    <PostEditor
      initial={initial}
      defaultKind={params.type === "blog" ? "blog" : "proof"}
      canPublish={hasPermission(session, "content.publish")}
      canDelete={hasPermission(session, "content.delete")}
    />
  );
}
