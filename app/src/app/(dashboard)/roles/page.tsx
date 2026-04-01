import { auth } from "@/lib/auth";
import { listOrgMembers, getUserRoles, listOrganizations } from "@/lib/keycloak-admin";
import type { OrgMember } from "@/types";

async function getFirstOrgId() {
  try {
    const orgs = await listOrganizations();
    return orgs.length > 0 ? orgs[0].id : null;
  } catch {
    return null;
  }
}

export default async function RolesPage() {
  const session = await auth();
  const orgId = await getFirstOrgId();

  let membersWithRoles: Array<OrgMember & { roles: string[] }> = [];

  if (orgId) {
    try {
      const members: OrgMember[] = await listOrgMembers(orgId);

      membersWithRoles = await Promise.all(
        members.map(async (member) => {
          try {
            const roles = await getUserRoles(member.id);
            return {
              ...member,
              roles: roles.map((r: { name: string }) => r.name),
            };
          } catch {
            return { ...member, roles: [] };
          }
        })
      );
    } catch {
      // Admin API may not be available
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Roles</h1>
        <p className="text-muted-foreground">
          View and manage member roles
        </p>
      </div>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">
                Member
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Roles
              </th>
            </tr>
          </thead>
          <tbody>
            {membersWithRoles.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No members found
                </td>
              </tr>
            ) : (
              membersWithRoles.map((member) => (
                <tr key={member.id} className="border-b">
                  <td className="px-4 py-3 text-sm">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {member.email}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {member.roles.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                          No roles
                        </span>
                      ) : (
                        member.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                          >
                            {role}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
