import { getActiveOrgId, getAllOrgIds } from "@/lib/active-org";
import { listOrgMembers, getOrgGroups, listGroupMembers } from "@/lib/keycloak-admin";
import type { OrgMember, OrgGroup } from "@/types";

async function getMembersWithGroups(orgId: string) {
  const [members, groups]: [OrgMember[], OrgGroup[]] = await Promise.all([
    listOrgMembers(orgId),
    getOrgGroups(orgId),
  ]);

  // For each group, fetch its members
  const groupMembers = new Map<string, Set<string>>();
  for (const group of groups) {
    try {
      const gMembers: { id: string }[] = await listGroupMembers(orgId, group.id);
      groupMembers.set(group.name, new Set(gMembers.map((m) => m.id)));
    } catch {
      // skip
    }
  }

  return members.map((member) => ({
    ...member,
    groups: groups
      .filter((g) => groupMembers.get(g.name)?.has(member.id))
      .map((g) => g.name),
  }));
}

export default async function RolesPage() {
  const orgId = await getActiveOrgId();

  let membersWithGroups: Array<OrgMember & { groups: string[] }> = [];

  if (orgId) {
    try {
      membersWithGroups = await getMembersWithGroups(orgId);
    } catch {
      // Admin API may not be available
    }
  } else {
    // "Tous" mode — aggregate from all orgs, deduplicate
    const orgIds = await getAllOrgIds();
    const seen = new Set<string>();
    for (const id of orgIds) {
      try {
        const members = await getMembersWithGroups(id);
        for (const m of members) {
          if (!seen.has(m.id)) {
            seen.add(m.id);
            membersWithGroups.push(m);
          }
        }
      } catch {
        // skip
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rôles</h1>
        <p className="text-muted-foreground">
          Consultez les rôles des membres de votre organisation
        </p>
      </div>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">
                Membre
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Rôles
              </th>
            </tr>
          </thead>
          <tbody>
            {membersWithGroups.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Aucun membre trouvé
                </td>
              </tr>
            ) : (
              membersWithGroups.map((member) => (
                <tr key={member.id} className="border-b">
                  <td className="px-4 py-3 text-sm">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {member.email}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {member.groups.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                          Aucun rôle
                        </span>
                      ) : (
                        member.groups.map((group) => (
                          <span
                            key={group}
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              group === "Admin"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : group === "Managers"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {group}
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
