import { redirect } from "next/navigation";
import { hasPermission, requirePermission } from "../../../lib/auth";
import { getMemberById } from "../../../lib/team-members";
import { TeamMemberEditor } from "./TeamMemberEditor";

export default async function NewTeamMember({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await requirePermission("member.write");
  const params = await searchParams;
  const initial = params.id ? await getMemberById(params.id) : null;
  if (params.id && !initial) redirect("/admin");

  return (
    <TeamMemberEditor
      initial={initial}
      canPublish={hasPermission(session, "member.publish")}
      canDelete={hasPermission(session, "member.delete")}
    />
  );
}
