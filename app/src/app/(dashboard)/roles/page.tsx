import { getActiveOrgId, getAllOrgIds } from "@/features/organization/lib/active-org";
import { ORG_GROUPS } from "@/features/shared/constants/org-groups";
import { listOrgMembers, getOrgGroups, listGroupMembers } from "@/features/members/lib/members-admin";
import type { OrgMember, OrgGroup } from "@/features/members/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

async function getMembersWithGroups(orgId: string) {
  const [members, groups]: [OrgMember[], OrgGroup[]] = await Promise.all([
    listOrgMembers(orgId),
    getOrgGroups(orgId),
  ]);

  // Fetch group members in parallel
  const groupMembers = new Map<string, Set<string>>();
  const groupResults = await Promise.allSettled(
    groups.map(async (group) => {
      const gMembers = await listGroupMembers(orgId, group.id);
      return { name: group.name, memberIds: new Set(gMembers.map((m: { id: string }) => m.id)) };
    })
  );
  for (const r of groupResults) {
    if (r.status === "fulfilled") {
      groupMembers.set(r.value.name, r.value.memberIds);
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
    // "Tous" mode — aggregate from all orgs in parallel, deduplicate
    const orgIds = await getAllOrgIds();
    const results = await Promise.allSettled(orgIds.map((id) => getMembersWithGroups(id)));
    const seen = new Set<string>();
    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      for (const m of r.value) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          membersWithGroups.push(m);
        }
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {membersWithGroups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground py-8"
                >
                  Aucun membre trouvé
                </TableCell>
              </TableRow>
            ) : (
              membersWithGroups.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="text-sm">
                    {member.firstName} {member.lastName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.groups.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                          Aucun rôle
                        </span>
                      ) : (
                        member.groups.map((group) => (
                          <Badge
                            key={group}
                            className={
                              group === ORG_GROUPS.ADMIN
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : group === ORG_GROUPS.MANAGERS
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }
                          >
                            {group}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
