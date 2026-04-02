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

export async function listOrganizations() {
  const res = await adminFetch("/organizations");
  if (!res.ok) throw new Error(`Failed to list organizations: ${res.status}`);
  return res.json();
}

export async function getOrganization(orgId: string) {
  const res = await adminFetch(`/organizations/${orgId}`);
  if (!res.ok) throw new Error(`Failed to get organization: ${res.status}`);
  return res.json();
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

export async function searchOrgByDomain(domain: string) {
  const res = await adminFetch(
    `/organizations?search=${encodeURIComponent(domain)}&exact=true`
  );
  if (!res.ok) throw new Error(`Failed to search organizations: ${res.status}`);
  const orgs = await res.json();
  return orgs.find((org: { domains?: Array<{ name: string }> }) =>
    org.domains?.some((d) => d.name === domain)
  ) ?? null;
}

export async function getUserOrganizations(userId: string) {
  const res = await adminFetch(`/users/${userId}/organizations`);
  if (!res.ok) throw new Error(`Failed to get user organizations: ${res.status}`);
  return res.json();
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

export async function getOrgGroups(orgId: string) {
  const res = await adminFetch(`/organizations/${orgId}/groups`);
  if (!res.ok) throw new Error(`Failed to get org groups: ${res.status}`);
  return res.json();
}

export async function addMemberToGroup(
  orgId: string,
  groupId: string,
  userId: string
) {
  const res = await adminFetch(
    `/organizations/${orgId}/groups/${groupId}/members`,
    { method: "POST", body: JSON.stringify([userId]) }
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

export async function listOrgMembers(orgId: string) {
  const res = await adminFetch(`/organizations/${orgId}/members`);
  if (!res.ok) throw new Error(`Failed to list members: ${res.status}`);
  return res.json();
}

// ── Invitations ──────────────────────────────────

export async function listOrgInvitations(orgId: string) {
  const res = await adminFetch(`/organizations/${orgId}/invitations`);
  if (!res.ok) throw new Error(`Failed to list invitations: ${res.status}`);
  return res.json();
}

export async function sendOrgInvitation(orgId: string, email: string) {
  const res = await adminFetch(`/organizations/${orgId}/invitations`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(`Failed to send invitation: ${res.status}`);
  return res.json();
}

export async function deleteOrgInvitation(orgId: string, invitationId: string) {
  const res = await adminFetch(
    `/organizations/${orgId}/invitations/${invitationId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(`Failed to delete invitation: ${res.status}`);
}

export async function getUserByEmail(email: string) {
  const res = await adminFetch(`/users?email=${encodeURIComponent(email)}&exact=true`);
  if (!res.ok) throw new Error(`Failed to search user by email: ${res.status}`);
  const users = await res.json();
  return users[0] ?? null;
}

// ── Roles ────────────────────────────────────────

export async function listRealmRoles() {
  const res = await adminFetch("/roles");
  if (!res.ok) throw new Error(`Failed to list roles: ${res.status}`);
  return res.json();
}

export async function getUserRoles(userId: string) {
  const res = await adminFetch(`/users/${userId}/role-mappings/realm`);
  if (!res.ok) throw new Error(`Failed to get user roles: ${res.status}`);
  return res.json();
}

export async function assignUserRole(userId: string, roles: Array<{ id: string; name: string }>) {
  const res = await adminFetch(`/users/${userId}/role-mappings/realm`, {
    method: "POST",
    body: JSON.stringify(roles),
  });
  if (!res.ok) throw new Error(`Failed to assign role: ${res.status}`);
}
