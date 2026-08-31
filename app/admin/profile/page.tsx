import type { Metadata } from "next";
import { requireAdmin } from "../../lib/auth";
import { getUserById, toAdminSession } from "../../lib/users";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = {
  title: "Profile — Blackspot CMS",
  description: "Edit your Blackspot admin profile",
  robots: { index: false, follow: false },
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default async function ProfilePage() {
  const session = await requireAdmin();
  const user = await getUserById(session.sub);
  return <ProfileForm initial={user ? toAdminSession(user) : session} />;
}
