import type { Metadata } from "next";
import { requireAdmin } from "../lib/auth";
import { AdminDashboard } from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Blackspot CMS",
  description: "Blackspot content administration",
  robots: { index: false, follow: false },
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default async function Admin() {
  const session = await requireAdmin();
  return <AdminDashboard initialUser={session} />;
}
