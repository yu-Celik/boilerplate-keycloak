import type { Metadata } from "next";

export const metadata: Metadata = { title: "Onboarding" };

import { redirect } from "next/navigation";
import { auth } from "@/features/auth/lib/auth";
import { getOnboardingState, createOrganizationAndRefresh, acceptInvitationFromOnboarding, joinOrganization } from "./actions";
import { suggestOrgName } from "@/features/organization/lib/email-domain";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  // Not authenticated at all — go to login
  if (!session?.user) redirect("/login");
  const { error } = await searchParams;

  const state = await getOnboardingState();
  if (!state) {
    redirect("/login");
  }

  const suggestedName = (state.alreadyMember || state.existingOrg) ? "" : (suggestOrgName(state.email) ?? "");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl">
            {state.alreadyMember
              ? "Nouvelle organisation"
              : `Bienvenue ${session.user.name ?? ""} !`}
          </CardTitle>
          <CardDescription>
            {state.alreadyMember
              ? "Créez une nouvelle organisation."
              : "Créez votre espace de travail pour commencer."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pending invitations */}
          {(state.pendingInvitations?.length ?? 0) > 0 && (
            <div className="space-y-3">
              {state.pendingInvitations?.map((inv) => (
                <PendingInvitationNotice
                  key={inv.invitationId}
                  orgId={inv.orgId}
                  orgName={inv.orgName}
                  invitationId={inv.invitationId}
                  role={inv.role}
                />
              ))}
            </div>
          )}

          {state.existingOrg && !state.alreadyMember ? (
            <ExistingOrgNotice
              orgId={state.existingOrg.id}
              orgName={state.existingOrg.name}
              autoJoinAvailable={state.autoJoinAvailable}
            />
          ) : null}

          {/* Separator when invitations exist */}
          {(state.pendingInvitations?.length ?? 0) > 0 && (
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-card px-2 text-xs uppercase text-muted-foreground">
                  ou créez une organisation
                </span>
              </div>
            </div>
          )}

          {error === "org_exists" && (
            <Alert variant="destructive">
              <AlertDescription>
                Ce nom d&apos;organisation est déjà pris. Choisissez un autre nom.
              </AlertDescription>
            </Alert>
          )}

          <form action={createOrganizationAndRefresh} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">
                Nom de l&apos;organisation
              </Label>
              <Input
                id="orgName"
                name="orgName"
                type="text"
                defaultValue={suggestedName}
                required
                placeholder="Nom de votre organisation"
              />
            </div>

            {state.isPublic && (
              <p className="text-xs text-muted-foreground">
                Votre adresse email utilise un domaine public. Votre
                organisation sera créée sans domaine associé.
              </p>
            )}

            <Button type="submit" className="w-full">
              Créer mon espace
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function PendingInvitationNotice({
  orgId,
  orgName,
  invitationId,
  role,
}: {
  orgId: string;
  orgName: string;
  invitationId: string;
  role: string;
}) {
  return (
    <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
      <AlertDescription className="space-y-3">
        <p className="text-sm text-green-800 dark:text-green-200">
          Vous êtes invité à rejoindre <strong>{orgName}</strong>
          {" "}en tant que <strong>{role}</strong>
        </p>
        <form action={acceptInvitationFromOnboarding}>
          <input type="hidden" name="orgId" value={orgId} />
          <input type="hidden" name="invitationId" value={invitationId} />
          <Button
            type="submit"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600"
          >
            Accepter l&apos;invitation
          </Button>
        </form>
      </AlertDescription>
    </Alert>
  );
}

function ExistingOrgNotice({
  orgId,
  orgName,
  autoJoinAvailable,
}: {
  orgId: string;
  orgName: string;
  autoJoinAvailable: boolean;
}) {
  return (
    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
      <AlertDescription className="space-y-3">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Une organisation <strong>{orgName}</strong> existe déjà pour
          votre domaine email.
        </p>
        <div className="flex gap-2 items-center flex-wrap">
          {autoJoinAvailable ? (
            <form action={joinOrganization}>
              <input type="hidden" name="orgId" value={orgId} />
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Rejoindre
              </Button>
            </form>
          ) : (
            <span className="text-xs text-muted-foreground">
              Contactez un administrateur pour rejoindre cette organisation.
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            ou créez votre propre espace ci-dessous
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
}
