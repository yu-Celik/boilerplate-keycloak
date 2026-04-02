"use server";

import { auth, signIn } from "@/lib/auth";
import {
  addOrgMember,
  deleteOrgInvitation,
  getUserByEmail,
} from "@/lib/keycloak-admin";

export async function acceptInvitation(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authenticated");

  const orgId = formData.get("orgId") as string;
  const invitationId = formData.get("invitationId") as string;
  if (!orgId || !invitationId) throw new Error("Missing parameters");

  // Resolve KC user ID
  const kcUser = await getUserByEmail(session.user.email);
  if (!kcUser?.id) throw new Error("User not found in Keycloak");

  // Add user to org
  await addOrgMember(orgId, kcUser.id);

  // Delete the invitation
  await deleteOrgInvitation(orgId, invitationId).catch(() => {});

  // Re-auth to get fresh token with new org
  await signIn("keycloak", { redirectTo: "/" });
}
