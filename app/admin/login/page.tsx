import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../../lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Blackspot CMS",
  description: "Blackspot content administration",
  robots: { index: false, follow: false },
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default async function AdminLogin() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="loginPage">
      <div className="loginCard">
        <img src="/blackspot-logo.png" alt="Blackspot" />
        <p className="sectionLabel">Blackspot CMS</p>
        <h1>Sign in</h1>
        <p>Use your administrator email and password.</p>
        <LoginForm />
      </div>
    </div>
  );
}
