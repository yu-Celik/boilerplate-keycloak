import type { OrgMember, OrgGroup } from "@/features/members/types";
import { adminFetch } from "@/features/shared/lib/keycloak-client";
import { getUserByEmail } from "@/features/shared/lib/keycloak-user";


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


export async function removeMemberFromGroup(
  orgId: string,
  groupId: string,
  userId: string
) {
  const res = await adminFetch(
    `/organizations/${orgId}/groups/${groupId}/members/${userId}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to remove member from group: ${res.status} ${body}`);
  }
}

export async function assertOrgRole(
  orgId: string,
  userEmail: string,
  requiredGroups: string[]
): Promise<void> {
  const kcUser = await getUserByEmail(userEmail);
  if (!kcUser?.id) throw new Error("Utilisateur introuvable");

  const groups = await getOrgGroups(orgId);
  const matchingGroups = groups.filter((g) => requiredGroups.includes(g.name));

  const results = await Promise.all(
    matchingGroups.map((g) => listGroupMembers(orgId, g.id))
  );
  if (results.some((members) => members.some((m) => m.id === kcUser.id))) return;

  throw new Error("Accès refusé : rôle insuffisant");
}
