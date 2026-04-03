import type { Organization, OrgMember, OrgInvitation, OrgGroup } from "@/types";
import { getInvitationRole } from "@/lib/invitation-role-store";

const KC_INTERNAL = process.env.KC_ISSUER_INTERNAL || "http://keycloak:8080/realms/boilerplate";
const KC_BASE = KC_INTERNAL.replace("/realms/boilerplate", "");

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getServiceAccountToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const response = await fetch(
    `${KC_INTERNAL}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.KC_SERVICE_ACCOUNT_CLIENT_ID!,
        client_secret: process.env.KC_SERVICE_ACCOUNT_CLIENT_SECRET!,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Service account auth failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 30) * 1000,
  };

  return cachedToken.token;
}

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getServiceAccountToken();
  return fetch(`${KC_BASE}/admin/realms/boilerplate${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

// ── Organizations ────────────────────────────────

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
  data: Partial<Pick<Organization, "name" | "alias" | "attributes" | "domains">>
) {
  const org = await getOrganization(orgId);
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

// ── Organization Groups ─────────────────────────

export async function createOrgGroup(orgId: string, name: string) {
  const res = await adminFetch(`/organizations/${orgId}/groups`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create org group: ${res.status} ${body}`);
  }
  const location = res.headers.get("Location");
  const groupId = location?.split("/").pop();
  return groupId ?? null;
}

export async function getOrgGroups(orgId: string): Promise<OrgGroup[]> {
  const res = await adminFetch(`/organizations/${orgId}/groups`);
  if (!res.ok) throw new Error(`Failed to get org groups: ${res.status}`);
  return res.json() as Promise<OrgGroup[]>;
}

export async function listGroupMembers(orgId: string, groupId: string): Promise<OrgMember[]> {
  const res = await adminFetch(`/organizations/${orgId}/groups/${groupId}/members`);
  if (!res.ok) throw new Error(`Failed to list group members: ${res.status}`);
  return res.json() as Promise<OrgMember[]>;
}

export async function addMemberToGroup(
  orgId: string,
  groupId: string,
  userId: string
) {
  const res = await adminFetch(
    `/organizations/${orgId}/groups/${groupId}/members/${userId}`,
    { method: "PUT" }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to add member to group: ${res.status} ${body}`);
  }
}

// ── Members ──────────────────────────────────────

export async function addOrgMember(orgId: string, userId: string) {
  const res = await adminFetch(`/organizations/${orgId}/members`, {
    method: "POST",
    body: JSON.stringify(userId),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to add org member: ${res.status} ${body}`);
  }
}

export async function listOrgMembers(orgId: string): Promise<OrgMember[]> {
  const res = await adminFetch(`/organizations/${orgId}/members`);
  if (!res.ok) throw new Error(`Failed to list members: ${res.status}`);
  return res.json() as Promise<OrgMember[]>;
}

// ── Invitations ──────────────────────────────────

export async function listOrgInvitations(orgId: string): Promise<OrgInvitation[]> {
  const res = await adminFetch(`/organizations/${orgId}/invitations`);
  if (!res.ok) throw new Error(`Failed to list invitations: ${res.status}`);
  return res.json() as Promise<OrgInvitation[]>;
}

export async function sendOrgInvitation(orgId: string, email: string) {
  const token = await getServiceAccountToken();
  const res = await fetch(
    `${KC_BASE}/admin/realms/boilerplate/organizations/${orgId}/members/invite-user`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ email }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to send invitation: ${res.status} ${body}`);
  }
}

export async function deleteOrgInvitation(orgId: string, invitationId: string) {
  const res = await adminFetch(
    `/organizations/${orgId}/invitations/${invitationId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(`Failed to delete invitation: ${res.status}`);
}

export async function getUserByEmail(email: string): Promise<OrgMember | null> {
  const res = await adminFetch(`/users?email=${encodeURIComponent(email)}&exact=true`);
  if (!res.ok) throw new Error(`Failed to search user by email: ${res.status}`);
  const users = (await res.json()) as OrgMember[];
  return users[0] ?? null;
}

// ── Authorization ───────────────────────────────

export async function assertOrgRole(
  orgId: string,
  userEmail: string,
  requiredGroups: string[]
): Promise<void> {
  const kcUser = await getUserByEmail(userEmail);
  if (!kcUser?.id) throw new Error("Utilisateur introuvable");

  const groups = await getOrgGroups(orgId);
  for (const group of groups) {
    if (!requiredGroups.includes(group.name)) continue;
    const members = await listGroupMembers(orgId, group.id);
    if (members.some((m) => m.id === kcUser.id)) return;
  }
  throw new Error("Accès refusé : rôle insuffisant");
}

// ── Pending Invitations (domain-scoped) ─────────

export async function getPendingInvitationsForUser(
  email: string,
  userOrgAliases: string[]
): Promise<Array<{ orgId: string; orgName: string; invitationId: string; role: string }>> {
  const result: Array<{ orgId: string; orgName: string; invitationId: string; role: string }> = [];

  // Domain-scoped search (not full realm scan)
  const domain = email.split("@")[1];
  if (!domain) return result;

  const domainOrgs: Organization[] = await adminFetch(
    `/organizations?search=${encodeURIComponent(domain)}`
  ).then((r) => (r.ok ? (r.json() as Promise<Organization[]>) : [])).catch(() => []);

  // Exclude orgs user already belongs to
  const filtered = domainOrgs.filter((org) => !userOrgAliases.includes(org.alias));

  // Check invitations in parallel
  const results = await Promise.allSettled(
    filtered.map(async (org) => {
      const invitations = await listOrgInvitations(org.id);
      return { org, invitations };
    })
  );

  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const { org, invitations } = r.value;
    for (const inv of invitations) {
      if (inv.email === email && inv.status === "PENDING") {
        const role = await getInvitationRole(org.id, email).catch(() => null) ?? "Members";
        result.push({ orgId: org.id, orgName: org.name, invitationId: inv.id, role });
      }
    }
  }

  return result;
}
