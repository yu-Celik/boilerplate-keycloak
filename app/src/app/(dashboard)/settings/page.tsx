import { getActiveOrgId } from "@/lib/active-org";
import { getOrganization, isAutoJoinEnabled, hasVerifiedDomain as checkVerifiedDomain } from "@/lib/keycloak-admin";
import { auth } from "@/lib/auth";
import { AutoJoinToggle } from "./auto-join-toggle";
import { DomainManager } from "./domain-manager";
import type { Organization } from "@/types";

export default async function SettingsPage() {
  const orgId = await getActiveOrgId();
  const session = await auth();

  let org: Organization | null = null;
  if (orgId) {
    try {
      org = await getOrganization(orgId);
    } catch {
      // Admin API may not be available
    }
  }

  const isAdmin = session?.orgRole === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">
          Paramètres de votre organisation
        </p>
      </div>

      {!orgId ? (
        <p className="text-sm text-muted-foreground">
          Sélectionnez une organisation pour voir ses paramètres.
        </p>
      ) : (
        <>
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Détails de l&apos;organisation</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nom</label>
                <p className="mt-1 text-lg">{org?.name || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Alias</label>
                <p className="mt-1 font-mono text-sm">{org?.alias || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID</label>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{org?.id || "N/A"}</p>
              </div>
            </div>
          </div>

          {org && (
            <DomainManager
              domain={org.domains?.[0]?.name ?? null}
              verified={org.domains?.[0]?.verified ?? false}
              verifyToken={org.attributes?.domainVerifyToken?.[0] ?? null}
              isAdmin={isAdmin}
            />
          )}

          {org && (
            <AutoJoinToggle
              enabled={isAutoJoinEnabled(org)}
              canToggle={checkVerifiedDomain(org)}
              hasVerifiedDomain={checkVerifiedDomain(org)}
              isAdmin={isAdmin}
            />
          )}
        </>
      )}
    </div>
  );
}
