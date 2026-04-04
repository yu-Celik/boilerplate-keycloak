import type { Organization } from "@/features/organization/types";
import type { OrgMember } from "@/features/members/types";
import { adminFetch } from "@/features/shared/lib/keycloak-client";


export async function listOrganizations(): Promise<Organization[]> {
  const res = await adminFetch("/organizations");
  if (!res.ok) throw new Error(`Failed to list organizations: ${res.status}`);
  return res.json() as Promise<Organization[]>;
}

export async function getOrganization(orgId: string): Promise<Organization> {
  const res = await adminFetch(`/organizations/${orgId}`);
  if (!res.ok) throw new Error(`Failed to get organization: ${res.status}`);
  return res.json() as Promise<Organization>;
}

export async function updateOrganization(
  orgId: string,
  data: Partial<Pick<Organization, "name" | "alias" | "attributes" | "domains" | "enabled">>,
  existingOrg?: Organization
) {
  const org = existingOrg ?? await getOrganization(orgId);
  const res = await adminFetch(`/organizations/${orgId}`, {
    method: "PUT",
    body: JSON.stringify({ ...org, ...data }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to update organization: ${res.status} ${body}`);
  }
}

export function isAutoJoinEnabled(org: Organization): boolean {
  return org.attributes?.autoJoin?.[0] === "true";
}

export function hasVerifiedDomain(org: Organization): boolean {
  return org.domains?.some((d) => d.verified) ?? false;
}

export async function getOrgByAlias(alias: string): Promise<Organization | null> {
  const res = await adminFetch(`/organizations?search=${encodeURIComponent(alias)}`);
  if (!res.ok) throw new Error(`Failed to search organizations: ${res.status}`);
  const orgs = (await res.json()) as Organization[];
  return orgs.find((o) => o.alias === alias) ?? null;
}

export async function createOrganization(
  name: string,
  alias: string,
  domains?: Array<{ name: string; verified: boolean }>
) {
  const res = await adminFetch("/organizations", {
    method: "POST",
    body: JSON.stringify({ name, alias, enabled: true, domains: domains ?? [] }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create organization: ${res.status} ${body}`);
  }
  const location = res.headers.get("Location");
  const orgId = location?.split("/").pop();
  if (!orgId) throw new Error("No organization ID returned from creation");
  return getOrganization(orgId);
}

export async function deleteOrganization(orgId: string) {
  const res = await adminFetch(`/organizations/${orgId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete organization: ${res.status}`);
}

export async function searchOrgByDomain(domain: string): Promise<Organization | null> {
  const res = await adminFetch(
    `/organizations?search=${encodeURIComponent(domain)}&exact=true`
  );
  if (!res.ok) throw new Error(`Failed to search organizations: ${res.status}`);
  const orgs = (await res.json()) as Organization[];
  return orgs.find((org) =>
    org.domains?.some((d) => d.name === domain)
  ) ?? null;
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const res = await adminFetch(`/organizations?memberUserId=${userId}`);
  if (!res.ok) throw new Error(`Failed to get user organizations: ${res.status}`);
  const candidates = (await res.json()) as Organization[];

  // Workaround: KC nightly memberUserId filter returns false positives.
  // Verify each membership by checking the actual members list.
  const verified = await Promise.all(
    candidates.map(async (org) => {
      const membersRes = await adminFetch(`/organizations/${org.id}/members`);
      if (!membersRes.ok) return null;
      const members = (await membersRes.json()) as OrgMember[];
      return members.some((m) => m.id === userId) ? org : null;
    })
  );
  return verified.filter((org): org is Organization => org !== null);
}
