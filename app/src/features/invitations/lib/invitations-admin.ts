import type { OrgInvitation } from "@/features/invitations/types";
import type { Organization } from "@/features/organization/types";
import { adminFetch } from "@/features/shared/lib/keycloak-client";
import { ORG_GROUPS } from "@/features/shared/constants/org-groups";
import { extractDomain } from "@/features/organization/lib/email-domain";
import { getInvitationRolesBatch } from "./role-store";

export async function listOrgInvitations(orgId: string): Promise<OrgInvitation[]> {
  const res = await adminFetch(`/organizations/${orgId}/invitations`);
  if (!res.ok) throw new Error(`Failed to list invitations: ${res.status}`);
  return res.json() as Promise<OrgInvitation[]>;
}

export async function sendOrgInvitation(orgId: string, email: string) {
  const res = await adminFetch(
    `/organizations/${orgId}/members/invite-user`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
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


export async function getPendingInvitationsForUser(
  email: string,
  userOrgAliases: string[]
): Promise<Array<{ orgId: string; orgName: string; invitationId: string; role: string }>> {
  const result: Array<{ orgId: string; orgName: string; invitationId: string; role: string }> = [];

  const domain = extractDomain(email);
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

  // Collect matching pending invitations
  const pending: Array<{ orgId: string; orgName: string; invitationId: string }> = [];
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const { org, invitations } = r.value;
    for (const inv of invitations) {
      if (inv.email === email && inv.status === "PENDING") {
        pending.push({ orgId: org.id, orgName: org.name, invitationId: inv.id });
      }
    }
  }

  // Batch role lookup (single file read)
  const roleMap = await getInvitationRolesBatch(
    pending.map((p) => ({ orgId: p.orgId, email }))
  ).catch(() => new Map<string, string>());

  for (const p of pending) {
    const key = `${p.orgId}:${email.toLowerCase()}`;
    result.push({ ...p, role: roleMap.get(key) ?? ORG_GROUPS.MEMBERS });
  }

  return result;
}
