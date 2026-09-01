import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "../../../lib/auth";
import { getInviteByToken } from "../../../lib/invite";
import { AcceptInviteForm } from "./AcceptInviteForm";

export const metadata: Metadata = {
  title: "Accept invite — Blackspot CMS",
  description: "Join the Blackspot CMS",
  robots: { index: false, follow: false },
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/admin");

  const { token } = await params;
  const invite = await getInviteByToken(token);

  return (
    <div className="loginPage">
      <div className="loginCard">
        <img src="/blackspot-logo.png" alt="Blackspot" />
        <p className="sectionLabel">Blackspot CMS</p>
        {invite ? (
          <>
            <h1>Join the team</h1>
            <p>Set your name and password to finish your invite.</p>
            <AcceptInviteForm token={token} email={invite.email} name={invite.name || ""} />
          </>
        ) : (
          <>
            <h1>Invite expired</h1>
            <p>This invite is invalid or has expired. Ask a super admin to send a new link.</p>
            <a className="publishBtn" href="/admin/login">Sign in</a>
          </>
        )}
      </div>
    </div>
  );
}
