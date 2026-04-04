import type { Organization } from "@/features/organization/types";
import { listOrganizations, updateOrganization } from "@/features/organization/lib/organization-admin";
import { listOrgMembers } from "@/features/members/lib/members-admin";

export async function getAllOrganizationsWithStats(): Promise<
  Array<Organization & { memberCount: number }>
> {
  const orgs = await listOrganizations();
  const withStats = await Promise.all(
    orgs.map(async (org) => {
      const members = await listOrgMembers(org.id).catch(() => []);
      return { ...org, memberCount: members.length };
    })
  );
  return withStats;
}

export async function setOrganizationEnabled(orgId: string, enabled: boolean): Promise<void> {
  await updateOrganization(orgId, { enabled });
}
