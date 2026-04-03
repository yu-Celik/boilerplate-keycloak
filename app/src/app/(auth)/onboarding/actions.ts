"use server";

import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  createOrganization,
  addOrgMember,
  deleteOrganization,
  searchOrgByDomain,
  getUserOrganizations,
  getUserByEmail,
  createOrgGroup,
  addMemberToGroup,
  getOrgGroups,
  listOrgInvitations,
  deleteOrgInvitation,
  getPendingInvitationsForUser,
  isAutoJoinEnabled,
  hasVerifiedDomain,
} from "@/lib/keycloak-admin";
import { getInvitationRole, deleteInvitationRole } from "@/lib/invitation-role-store";
import { extractDomain, isPublicDomain } from "@/lib/email-domain";

const DEFAULT_GROUPS = ["Admin", "Managers", "Members"] as const;

export async function getOnboardingState() {
  const session = await auth();
  if (!session?.user) return null;
  // Email may be missing if KC profile doesn't include it — use empty string as fallback
  const email = session.user.email ?? "";
  if (!email) return { email: "", domain: "", isPublic: true, existingOrg: null };

  const domain = extractDomain(email);
  const isPublic = isPublicDomain(domain);

  let existingOrg = null;
  let alreadyMember = false;
  if (!isPublic) {
    existingOrg = await searchOrgByDomain(domain).catch(() => null);
    // Check if user is already a member of this org
    if (existingOrg) {
      const kcUser = await getUserByEmail(email).catch(() => null);
      if (kcUser?.id) {
        const userOrgs = await getUserOrganizations(kcUser.id).catch(() => []);
        alreadyMember = userOrgs.some((o: { id: string }) => o.id === existingOrg!.id);
      }
    }
  }

  // Check for pending invitations (domain-scoped, not full realm scan)
  const userOrgAliases = session.organization ? Object.keys(session.organization) : [];
  const pendingInvitations = await getPendingInvitationsForUser(email, userOrgAliases).catch(() => []);

  const autoJoinAvailable = existingOrg
    ? isAutoJoinEnabled(existingOrg) && hasVerifiedDomain(existingOrg)
    : false;

  return {
    email,
    domain,
    isPublic,
    existingOrg,
    alreadyMember,
    autoJoinAvailable,
    pendingInvitations,
  };
}

export async function createOrganizationAndRefresh(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const rawOrgName = formData.get("orgName");
  if (typeof rawOrgName !== "string" || !rawOrgName.trim()) {
    throw new Error("Organization name is required");
  }
  const orgName = rawOrgName.trim();

  const email = session.user.email;
  // Resolve KC user ID from email (session.user.id is NextAuth ID, not KC ID)
  const kcUser = await getUserByEmail(email);
  if (!kcUser?.id) {
    throw new Error("User not found in Keycloak");
  }
  const userId = kcUser.id;

  const alias = orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Orgs are created without a domain — domain must be claimed
  // and verified via DNS TXT in the settings page
  let org;
  try {
    org = await createOrganization(orgName, alias);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("409")) {
      redirect("/onboarding?error=org_exists");
    }
    throw e;
  }

  // Add user as member
  try {
    await addOrgMember(org.id, userId);
  } catch (e) {
    // Cleanup: delete the org if member add fails
    await deleteOrganization(org.id).catch(() => {});
    throw new Error(`Failed to add you to the organization: ${(e as Error).message}`);
  }

  // Seed default groups (non-critical — log and continue on failure)
  for (const groupName of DEFAULT_GROUPS) {
    try {
      const groupId = await createOrgGroup(org.id, groupName);
      // Add creator to Admin + Members groups
      if ((groupName === "Admin" || groupName === "Members") && groupId) {
        await addMemberToGroup(org.id, groupId, userId).catch(() => {
          console.warn(`Failed to add user to ${groupName} group`);
        });
      }
    } catch {
      console.warn(`Failed to create org group: ${groupName}`);
    }
  }

  // Force re-sign-in to get a fresh token with organization:* scope
  // KC session cookie is still valid, so this is transparent to the user
  await signIn("keycloak", { redirectTo: "/" });
}

export async function acceptInvitationFromOnboarding(formData: FormData): Promise<void> {
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

  // Assign the role/group chosen at invitation time
  const role = await getInvitationRole(orgId, session.user.email).catch(() => null);
  const targetRole = role ?? "Members";
  try {
    const groups = await getOrgGroups(orgId);
    const targetGroup = groups.find((g) => g.name === targetRole);
    const membersGroup = groups.find((g) => g.name === "Members");
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

  // Re-auth to get fresh token with new org
  await signIn("keycloak", { redirectTo: "/" });
}

export async function joinOrganization(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authenticated");

  const orgId = formData.get("orgId") as string;
  if (!orgId) throw new Error("Missing organization ID");

  // SECURITY: Verify auto-join is enabled and domain is verified
  const org = await searchOrgByDomain(extractDomain(session.user.email));
  if (!org || org.id !== orgId) throw new Error("Organisation introuvable");
  if (!isAutoJoinEnabled(org) || !hasVerifiedDomain(org)) {
    throw new Error("Auto-join non disponible pour cette organisation");
  }

  // Verify user's email domain matches org domain
  const userDomain = extractDomain(session.user.email);
  const domainMatch = org.domains?.some((d) => d.name === userDomain && d.verified);
  if (!domainMatch) throw new Error("Votre domaine email ne correspond pas");

  const kcUser = await getUserByEmail(session.user.email);
  if (!kcUser?.id) throw new Error("Utilisateur introuvable dans Keycloak");

  // Add to org (ignore 409 = already member)
  try {
    await addOrgMember(orgId, kcUser.id);
  } catch (e) {
    const msg = (e as Error).message;
    if (!msg.includes("409")) throw e;
  }

  // Assign to Members group
  try {
    const groups = await getOrgGroups(orgId);
    const membersGroup = groups.find((g) => g.name === "Members");
    if (membersGroup) {
      await addMemberToGroup(orgId, membersGroup.id, kcUser.id);
    }
  } catch (e) {
    console.error("Failed to assign Members group after auto-join:", e);
  }

  await signIn("keycloak", { redirectTo: "/" });
}
