"use server";

import { auth, signIn } from "@/lib/auth";
import {
  createOrganization,
  addOrgMember,
  deleteOrganization,
  searchOrgByDomain,
  getUserOrganizations,
  getUserByEmail,
  createOrgGroup,
  addMemberToGroup,
  listOrganizations,
  listOrgInvitations,
  deleteOrgInvitation,
} from "@/lib/keycloak-admin";
import { extractDomain, isPublicDomain } from "@/lib/email-domain";
import type { OrgInvitation } from "@/types";

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

  // Check for pending invitations across all orgs
  let pendingInvitations: Array<{ orgId: string; orgName: string; invitationId: string }> = [];
  try {
    const allOrgs = await listOrganizations();
    for (const org of allOrgs) {
      const invitations: OrgInvitation[] = await listOrgInvitations(org.id).catch(() => []);
      const matching = invitations.filter(
        (inv) => inv.email === email && inv.status === "PENDING"
      );
      for (const inv of matching) {
        pendingInvitations.push({ orgId: org.id, orgName: org.name, invitationId: inv.id });
      }
    }
  } catch {
    // non-critical
  }

  return {
    email,
    domain,
    isPublic,
    existingOrg,
    alreadyMember,
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
  const domain = extractDomain(email);
  const isPublic = isPublicDomain(domain);
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

  // Create org — with domain only for the first org on this domain
  // If domain is already claimed by another org, create without domain
  let domains: { name: string; verified: boolean }[] | undefined;
  if (!isPublic) {
    const existingOrg = await searchOrgByDomain(domain).catch(() => null);
    if (!existingOrg) {
      domains = [{ name: domain, verified: false }];
    }
  }
  const org = await createOrganization(orgName, alias, domains);

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

  const kcUser = await getUserByEmail(session.user.email);
  if (!kcUser?.id) throw new Error("User not found in Keycloak");

  await addOrgMember(orgId, kcUser.id);
  await deleteOrgInvitation(orgId, invitationId).catch(() => {});

  // Re-auth to get fresh token with new org
  await signIn("keycloak", { redirectTo: "/" });
}
