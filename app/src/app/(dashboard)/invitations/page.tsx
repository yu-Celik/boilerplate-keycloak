import { getActiveOrgId, getAllOrgIds } from "@/lib/active-org";
import { listOrgInvitations } from "@/lib/keycloak-admin";
import { inviteUser, revokeInvitation } from "./actions";
import type { OrgInvitation } from "@/types";

export default async function InvitationsPage() {
  const orgId = await getActiveOrgId();

  let invitations: OrgInvitation[] = [];
  if (orgId) {
    try {
      invitations = await listOrgInvitations(orgId);
    } catch {
      // Admin API may not be available
    }
  } else {
    // "Tous" mode — aggregate invitations from all orgs
    const orgIds = await getAllOrgIds();
    for (const id of orgIds) {
      try {
        const orgInvitations = await listOrgInvitations(id);
        invitations.push(...orgInvitations);
      } catch {
        // skip
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invitations</h1>
        <p className="text-muted-foreground">
          Gérez les invitations de votre organisation
        </p>
      </div>

      {/* Invite form — only when a specific org is selected */}
      {orgId ? (
        <form action={inviteUser} className="flex gap-3">
          <input
            type="email"
            name="email"
            placeholder="collaborateur@exemple.com"
            required
            className="flex-1 rounded-md border bg-background px-4 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Envoyer
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          Sélectionnez une organisation pour envoyer des invitations.
        </p>
      )}

      {/* Invitations list */}
      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Statut
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Envoyée le
              </th>
              {orgId && (
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 ? (
              <tr>
                <td
                  colSpan={orgId ? 4 : 3}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Aucune invitation envoyée
                </td>
              </tr>
            ) : (
              invitations.map((inv) => (
                <tr key={inv.id} className="border-b">
                  <td className="px-4 py-3 text-sm">{inv.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        inv.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {inv.status === "PENDING" ? "En attente" : "Expirée"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(inv.sentDate * 1000).toLocaleDateString("fr-FR")}
                  </td>
                  {orgId && (
                    <td className="px-4 py-3 text-right">
                      <form action={revokeInvitation} className="inline">
                        <input
                          type="hidden"
                          name="invitationId"
                          value={inv.id}
                        />
                        <button
                          type="submit"
                          className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Révoquer
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
