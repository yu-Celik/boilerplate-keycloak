import { auth } from "@/lib/auth";
import { listOrgMembers, listOrganizations } from "@/lib/keycloak-admin";
import type { OrgMember } from "@/types";

async function getFirstOrgId() {
  try {
    const orgs = await listOrganizations();
    return orgs.length > 0 ? orgs[0].id : null;
  } catch {
    return null;
  }
}

export default async function MembersPage() {
  const session = await auth();
  const orgId = await getFirstOrgId();

  let members: OrgMember[] = [];
  if (orgId) {
    try {
      members = await listOrgMembers(orgId);
    } catch {
      // Admin API may not be available
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Members</h1>
        <p className="text-muted-foreground">
          Manage organization members
        </p>
      </div>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No members found
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="border-b">
                  <td className="px-4 py-3 text-sm">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {member.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        member.enabled
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {member.enabled ? "Active" : "Disabled"}
                    </span>
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
