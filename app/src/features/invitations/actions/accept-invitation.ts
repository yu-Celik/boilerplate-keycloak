"use server";

import { auth, signIn } from "@/features/auth/lib/auth";
import { ORG_GROUPS, DEFAULT_GROUPS, type OrgGroupName } from "@/features/shared/constants/org-groups";
import { addOrgMember, getOrgGroups, addMemberToGroup } from "@/features/members/lib/members-admin";
import { getUserByEmail } from "@/features/shared/lib/keycloak-user";
import { listOrgInvitations, deleteOrgInvitation } from "@/features/invitations/lib/invitations-admin";
import { getInvitationRole, deleteInvitationRole } from "@/features/invitations/lib/role-store";

export async function acceptInvitation(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authenticated");

  const orgId = formData.get("orgId") as string;
  const invitationId = formData.get("invitationId") as string;
  if (!orgId || !invitationId) throw new Error("Missing parameters");

  // SECURITY: Validate invitation belongs to this user and is pending
  const invitations = await listOrgInvitations(orgId);
  const invitation = invitations.find((inv) => inv.id === invitationId);
  if (!invitation) throw new Error("Invitation introuvable");
  if (invitation.email !== session.user.email) throw new Error("Accès refusé");
  if (invitation.status !== "PENDING") throw new Error("Invitation expirée");

  const kcUser = await getUserByEmail(session.user.email);
  if (!kcUser?.id) throw new Error("Utilisateur introuvable dans Keycloak");

  // Add user to org (ignore 409 = already member)
  try {
    await addOrgMember(orgId, kcUser.id);
  } catch (e) {
    const msg = (e as Error).message;
    if (!msg.includes("409")) throw e;
  }

  // Assign the role/group chosen at invitation time (re-validate stored value)
  const role = await getInvitationRole(orgId, session.user.email).catch(() => null);
  const targetRole = (role && DEFAULT_GROUPS.includes(role as OrgGroupName)) ? role : ORG_GROUPS.MEMBERS;
  try {
    const groups = await getOrgGroups(orgId);
    const targetGroup = groups.find((g) => g.name === targetRole);
    const membersGroup = groups.find((g) => g.name === ORG_GROUPS.MEMBERS);
    if (targetGroup) {
      await addMemberToGroup(orgId, targetGroup.id, kcUser.id);
    }
    // Always add to Members group as well
    if (membersGroup && membersGroup.id !== targetGroup?.id) {
      await addMemberToGroup(orgId, membersGroup.id, kcUser.id);
    }
  } catch (e) {
    console.error("Failed to assign group after acceptance:", e);
  }

  await deleteInvitationRole(orgId, session.user.email).catch(() => {});
  await deleteOrgInvitation(orgId, invitationId).catch((e) =>
    console.error("Failed to delete invitation after acceptance:", e)
  );

  await signIn("keycloak", { redirectTo: "/" });
}
