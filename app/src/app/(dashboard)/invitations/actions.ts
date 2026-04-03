"use server";

import { auth } from "@/lib/auth";
import { getActiveOrgId } from "@/lib/active-org";
import { sendOrgInvitation, deleteOrgInvitation, listOrgInvitations, assertOrgRole } from "@/lib/keycloak-admin";
import { saveInvitationRole, deleteInvitationRole } from "@/lib/invitation-role-store";
import { redirect } from "next/navigation";

const VALID_ROLES = ["Admin", "Managers", "Members"] as const;

export async function inviteUser(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Non authentifié");

  const email = formData.get("email") as string;
  if (!email) throw new Error("Email requis");

  const role = formData.get("role") as string;
  if (!role || !VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
    throw new Error("Rôle invalide");
  }

  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("Sélectionnez une organisation");

  // SECURITY: Verify caller is Admin or Manager
  await assertOrgRole(orgId, session.user.email, ["Admin", "Managers"]);

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
  await assertOrgRole(orgId, session.user.email, ["Admin", "Managers"]);

  // Get invitation email before deleting to clean up role store
  const invitations = await listOrgInvitations(orgId);
  const invitation = invitations.find((inv) => inv.id === invitationId);

  await deleteOrgInvitation(orgId, invitationId);

  if (invitation) {
    await deleteInvitationRole(orgId, invitation.email).catch(() => {});
  }

  redirect("/invitations");
}
