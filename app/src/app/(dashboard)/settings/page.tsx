import { getActiveOrgId } from "@/features/organization/lib/active-org";
import { getOrganization, isAutoJoinEnabled, hasVerifiedDomain as checkVerifiedDomain } from "@/features/organization/lib/organization-admin";
import { listOrgMembers } from "@/features/members/lib/members-admin";
import { auth } from "@/features/auth/lib/auth";
import { AutoJoinToggle } from "./auto-join-toggle";
import { DomainManager } from "./domain-manager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Organization } from "@/features/organization/types";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const orgId = await getActiveOrgId();
  const session = await auth();

  let org: Organization | null = null;
  let memberCount = 0;
  if (orgId) {
    const [orgResult, membersResult] = await Promise.allSettled([
      getOrganization(orgId),
      listOrgMembers(orgId),
    ]);
    org = orgResult.status === "fulfilled" ? orgResult.value : null;
    memberCount = membersResult.status === "fulfilled" ? membersResult.value.length : 0;
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

      {welcome === "true" && (
        <Alert>
          <AlertDescription>
            Bienvenue ! Ajoutez votre domaine pour activer l&apos;auto-join des membres.
          </AlertDescription>
        </Alert>
      )}

      {!orgId ? (
        <p className="text-sm text-muted-foreground">
          Sélectionnez une organisation pour voir ses paramètres.
        </p>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Détails de l&apos;organisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom</p>
                  <p className="mt-1 text-lg">{org?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alias</p>
                  <p className="mt-1 font-mono text-sm">{org?.alias || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{org?.id || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader>
              <CardTitle>Membres</CardTitle>
              <CardDescription>
                {memberCount} membre{memberCount !== 1 ? "s" : ""} dans votre organisation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/members">Gérer les membres</Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
