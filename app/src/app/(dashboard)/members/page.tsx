import { getActiveOrgId, getAllOrgIds } from "@/lib/active-org";
import { listOrgMembers } from "@/lib/keycloak-admin";
import type { OrgMember } from "@/types";

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
    // "Tous" mode — aggregate members from all orgs, deduplicate by ID
    const orgIds = await getAllOrgIds();
    const seen = new Set<string>();
    for (const id of orgIds) {
      try {
        const orgMembers = await listOrgMembers(id);
        for (const m of orgMembers) {
          if (!seen.has(m.id)) {
            seen.add(m.id);
            members.push(m);
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
        <h1 className="text-3xl font-bold">Membres</h1>
        <p className="text-muted-foreground">
          Gérez les membres de votre organisation
        </p>
      </div>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">
                Nom
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Statut
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
                  Aucun membre trouvé
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
                      {member.enabled ? "Actif" : "Désactivé"}
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
