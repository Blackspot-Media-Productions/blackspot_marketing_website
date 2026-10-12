import { requireAdmin } from "../../lib/auth";
import { TeamPage } from "./Team";

export default async function Team() {
  const session = await requireAdmin();
  return <TeamPage initialUser={session} />;
}
