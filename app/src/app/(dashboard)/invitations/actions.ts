"use server";

import { auth } from "@/features/auth/lib/auth";
import { getActiveOrgId } from "@/features/organization/lib/active-org";
import { sendOrgInvitation, deleteOrgInvitation, listOrgInvitations } from "@/features/invitations/lib/invitations-admin";
import { assertOrgRole } from "@/features/members/lib/members-admin";
import { saveInvitationRole, deleteInvitationRole } from "@/features/invitations/lib/role-store";
import { DEFAULT_GROUPS, ORG_GROUPS, type OrgGroupName } from "@/features/shared/constants/org-groups";
import { redirect } from "next/navigation";

export async function inviteUser(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Non authentifié");

  const email = formData.get("email") as string;
  if (!email) throw new Error("Email requis");

  const role = formData.get("role") as string;
  if (!role || !DEFAULT_GROUPS.includes(role as OrgGroupName)) {
    throw new Error("Rôle invalide");
  }

  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("Sélectionnez une organisation");

  // SECURITY: Verify caller is Admin or Manager
  await assertOrgRole(orgId, session.user.email, [ORG_GROUPS.ADMIN, ORG_GROUPS.MANAGERS]);

  // SECURITY: Managers cannot grant Admin role (privilege escalation prevention)
  if (role === ORG_GROUPS.ADMIN) {
    await assertOrgRole(orgId, session.user.email, [ORG_GROUPS.ADMIN]);
  }

  await sendOrgInvitation(orgId, email);
  await saveInvitationRole(orgId, email, role);
  redirect("/invitations");
}

export async function revokeInvitation(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Non authentifié");

  const invitationId = formData.get("invitationId") as string;
  if (!invitationId) throw new Error("ID invitation requis");

  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("Sélectionnez une organisation");

  // SECURITY: Verify caller is Admin or Manager
  await assertOrgRole(orgId, session.user.email, [ORG_GROUPS.ADMIN, ORG_GROUPS.MANAGERS]);

  // Get invitation email before deleting to clean up role store
  const invitations = await listOrgInvitations(orgId);
  const invitation = invitations.find((inv) => inv.id === invitationId);

  await deleteOrgInvitation(orgId, invitationId);

  if (invitation) {
    await deleteInvitationRole(orgId, invitation.email).catch(() => {});
  }

  redirect("/invitations");
}
