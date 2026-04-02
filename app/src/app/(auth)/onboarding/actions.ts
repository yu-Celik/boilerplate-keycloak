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
} from "@/lib/keycloak-admin";
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
  if (!isPublic) {
    existingOrg = await searchOrgByDomain(domain).catch(() => null);
  }

  return {
    email,
    domain,
    isPublic,
    existingOrg,
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

  // SECURITY: Idempotency check — prevent duplicate org creation on double-submit
  const existingUserOrgs = await getUserOrganizations(userId).catch(() => []);
  if (existingUserOrgs.length > 0) {
    // User already has an org — just re-sign-in to refresh token
    await signIn("keycloak", { redirectTo: "/" });
    return;
  }

  const alias = orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Create org — with domain for professional emails, domainless for public
  const domains = isPublic
    ? undefined
    : [{ name: domain, verified: false }];
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
      // Add creator to Admin group
      if (groupName === "Admin" && groupId) {
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
