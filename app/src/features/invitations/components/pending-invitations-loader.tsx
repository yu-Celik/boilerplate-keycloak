import { auth } from "@/features/auth/lib/auth";
import { getPendingInvitationsForUser } from "@/features/invitations/lib/invitations-admin";
import { PendingInvitationsBanner } from "./pending-invitations-banner";

export async function PendingInvitationsLoader() {
  const session = await auth();
  const userEmail = session?.user?.email ?? "";
  if (!userEmail) return null;

  const orgAliases = Object.keys(session?.organization ?? {});

  let invitations: Array<{ orgId: string; orgName: string; invitationId: string; role: string }> = [];
  try {
    invitations = await getPendingInvitationsForUser(userEmail, orgAliases);
  } catch {
    return null;
  }

  return <PendingInvitationsBanner invitations={invitations} />;
}
