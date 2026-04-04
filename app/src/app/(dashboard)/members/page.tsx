import { getActiveOrgId, getAllOrgIds } from "@/features/organization/lib/active-org";
import { listOrgMembers } from "@/features/members/lib/members-admin";
import type { OrgMember } from "@/features/members/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function MembersPage() {
  const orgId = await getActiveOrgId();

  let members: OrgMember[] = [];
  if (orgId) {
    try {
      members = await listOrgMembers(orgId);
    } catch {
      // Admin API may not be available
    }
  } else {
    // "Tous" mode — aggregate members from all orgs in parallel, deduplicate
    const orgIds = await getAllOrgIds();
    const results = await Promise.allSettled(orgIds.map((id) => listOrgMembers(id)));
    const seen = new Set<string>();
    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      for (const m of r.value) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          members.push(m);
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Membres</h1>
        <p className="text-muted-foreground">
          Gérez les membres de votre organisation
        </p>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground py-8"
                >
                  Aucun membre trouvé
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="text-sm">
                    {member.firstName} {member.lastName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    {member.enabled ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Actif
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Désactivé</Badge>
                    )}
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
