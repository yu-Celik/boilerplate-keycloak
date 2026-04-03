"use server";

import { auth } from "@/lib/auth";
import { getActiveOrgId } from "@/lib/active-org";
import { sendOrgInvitation, deleteOrgInvitation, assertOrgRole } from "@/lib/keycloak-admin";
import { redirect } from "next/navigation";

export async function inviteUser(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Non authentifié");

  const email = formData.get("email") as string;
  if (!email) throw new Error("Email requis");

  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("Sélectionnez une organisation");

  // SECURITY: Verify caller is Admin or Manager
  await assertOrgRole(orgId, session.user.email, ["Admin", "Managers"]);

  await sendOrgInvitation(orgId, email);
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

  await deleteOrgInvitation(orgId, invitationId);
  redirect("/invitations");
}
