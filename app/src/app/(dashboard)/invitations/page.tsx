import { auth } from "@/features/auth/lib/auth";
import { getActiveOrgId, getAllOrgIds } from "@/features/organization/lib/active-org";
import { ORG_GROUPS } from "@/features/shared/constants/org-groups";
import { listOrgInvitations } from "@/features/invitations/lib/invitations-admin";
import { getInvitationRolesBatch } from "@/features/invitations/lib/role-store";
import { inviteUser, revokeInvitation } from "./actions";
import { RevokeForm } from "@/features/invitations/components/revoke-form";
import type { OrgInvitation } from "@/features/invitations/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function InvitationsPage() {
  const session = await auth();
  const canManageInvitations = session?.orgRole === "admin" || session?.orgRole === "manager";
  const canInviteAsAdmin = session?.orgRole === "admin";
  const orgId = await getActiveOrgId();

  let rawInvitations: OrgInvitation[] = [];
  if (orgId) {
    try {
      rawInvitations = await listOrgInvitations(orgId);
    } catch {
      // Admin API may not be available
    }
  } else {
    // "Tous" mode — aggregate invitations from all orgs in parallel
    const orgIds = await getAllOrgIds();
    const results = await Promise.allSettled(orgIds.map((id) => listOrgInvitations(id)));
    for (const r of results) {
      if (r.status === "fulfilled") rawInvitations.push(...r.value);
    }
  }

  // Enrich invitations with stored role (single file read)
  const roleMap = await getInvitationRolesBatch(
    rawInvitations.map((inv) => ({ orgId: inv.organizationId, email: inv.email }))
  ).catch(() => new Map<string, string>());
  const invitations = rawInvitations.map((inv) => {
    const key = `${inv.organizationId}:${inv.email.toLowerCase()}`;
    return { ...inv, role: roleMap.get(key) ?? ORG_GROUPS.MEMBERS };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invitations</h1>
        <p className="text-muted-foreground">
          Gérez les invitations de votre organisation
        </p>
      </div>

      {/* Invite form — only for Admin/Manager when a specific org is selected */}
      {orgId && canManageInvitations ? (
        <form action={inviteUser} className="flex gap-3">
          <Input
            type="email"
            name="email"
            placeholder="collaborateur@exemple.com"
            required
            className="flex-1"
          />
          <Select name="role" defaultValue={ORG_GROUPS.MEMBERS}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ORG_GROUPS.MEMBERS}>Membre</SelectItem>
              <SelectItem value={ORG_GROUPS.MANAGERS}>Manager</SelectItem>
              {canInviteAsAdmin && (
                <SelectItem value={ORG_GROUPS.ADMIN}>Admin</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button type="submit">Envoyer</Button>
        </form>
      ) : orgId ? (
        <p className="text-sm text-muted-foreground">
          Seuls les administrateurs et managers peuvent envoyer des invitations.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Sélectionnez une organisation pour envoyer des invitations.
        </p>
      )}

      {/* Invitations list */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Envoyée le</TableHead>
              {orgId && canManageInvitations && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={orgId && canManageInvitations ? 5 : 4}
                  className="text-center text-muted-foreground py-8"
                >
                  Aucune invitation envoyée
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-sm">{inv.email}</TableCell>
                  <TableCell className="text-sm">{inv.role}</TableCell>
                  <TableCell>
                    {inv.status === "PENDING" ? (
                      <Badge variant="outline">En attente</Badge>
                    ) : (
                      <Badge variant="destructive">Expirée</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(inv.sentDate * 1000).toLocaleDateString("fr-FR")}
                  </TableCell>
                  {orgId && canManageInvitations && (
                    <TableCell className="text-right">
                      <RevokeForm action={revokeInvitation} invitationId={inv.id} />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
