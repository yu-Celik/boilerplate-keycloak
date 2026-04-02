"use server";

import { getActiveOrgId } from "@/lib/active-org";
import { sendOrgInvitation, deleteOrgInvitation } from "@/lib/keycloak-admin";
import { redirect } from "next/navigation";

export async function inviteUser(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) throw new Error("Email requis");

  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("Sélectionnez une organisation");

  await sendOrgInvitation(orgId, email);
  redirect("/invitations");
}

export async function revokeInvitation(formData: FormData) {
  const invitationId = formData.get("invitationId") as string;
  if (!invitationId) throw new Error("ID invitation requis");

  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("Sélectionnez une organisation");

  await deleteOrgInvitation(orgId, invitationId);
  redirect("/invitations");
}
