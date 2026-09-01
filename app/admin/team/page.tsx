import type { Metadata } from "next";
import { requireSuperAdmin } from "../../lib/auth";
import { TeamPanel } from "./TeamPanel";

export const metadata: Metadata = {
  title: "Team — Blackspot CMS",
  description: "Invite and manage Blackspot CMS access",
  robots: { index: false, follow: false },
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default async function TeamPage() {
  const session = await requireSuperAdmin();
  return <TeamPanel initialUser={session} />;
}
