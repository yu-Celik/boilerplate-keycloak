import type { Metadata } from "next";

export const metadata: Metadata = { title: "Onboarding" };

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOnboardingState, createOrganizationAndRefresh, acceptInvitationFromOnboarding } from "./actions";
import { suggestOrgName } from "@/lib/email-domain";

export default async function OnboardingPage() {
  const session = await auth();
  // Not authenticated at all — go to login
  if (!session?.user) redirect("/login");

  const state = await getOnboardingState();
  if (!state) {
    redirect("/login");
  }

  const suggestedName = state.alreadyMember ? "" : (suggestOrgName(state.email) ?? "");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">
            {state.alreadyMember
              ? "Nouvelle organisation"
              : `Bienvenue ${session.user.name ?? ""} !`}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {state.alreadyMember
              ? "Créez une nouvelle organisation."
              : "Créez votre espace de travail pour commencer."}
          </p>
        </div>

        {/* Pending invitations */}
        {(state.pendingInvitations?.length ?? 0) > 0 && (
          <div className="space-y-3">
            {state.pendingInvitations?.map((inv) => (
              <PendingInvitationNotice
                key={inv.invitationId}
                orgId={inv.orgId}
                orgName={inv.orgName}
                invitationId={inv.invitationId}
              />
            ))}
          </div>
        )}

        {state.existingOrg && !state.alreadyMember ? (
          <ExistingOrgNotice orgName={state.existingOrg.name} />
        ) : null}

        {/* Separator when invitations exist */}
        {(state.pendingInvitations?.length ?? 0) > 0 && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                ou créez une organisation
              </span>
            </div>
          </div>
        )}

        <form action={createOrganizationAndRefresh} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="orgName"
              className="text-sm font-medium leading-none"
            >
              Nom de l&apos;organisation
            </label>
            <input
              id="orgName"
              name="orgName"
              type="text"
              defaultValue={suggestedName}
              required
              className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
              placeholder="Nom de votre organisation"
            />
          </div>

          {state.isPublic && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Votre adresse email utilise un domaine public. Votre
              organisation sera créée sans domaine associé.
            </p>
          )}

          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white ring-offset-white transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus-visible:ring-gray-300"
          >
            Créer mon espace
          </button>
        </form>
      </div>
    </div>
  );
}

function PendingInvitationNotice({
  orgId,
  orgName,
  invitationId,
}: {
  orgId: string;
  orgName: string;
  invitationId: string;
}) {
  return (
    <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
      <p className="text-sm text-green-800 dark:text-green-200">
        Vous êtes invité à rejoindre <strong>{orgName}</strong>
      </p>
      <div className="mt-3">
        <form action={acceptInvitationFromOnboarding}>
          <input type="hidden" name="orgId" value={orgId} />
          <input type="hidden" name="invitationId" value={invitationId} />
          <button
            type="submit"
            className="inline-flex h-8 items-center rounded-md bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          >
            Accepter l&apos;invitation
          </button>
        </form>
      </div>
    </div>
  );
}

function ExistingOrgNotice({ orgName }: { orgName: string }) {
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
      <p className="text-sm text-blue-800 dark:text-blue-200">
        Une organisation <strong>{orgName}</strong> existe déjà pour
        votre domaine email.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="inline-flex h-8 items-center rounded-md border border-blue-300 bg-white px-3 text-xs font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
          disabled
          title="Bientôt disponible"
        >
          Demander à rejoindre
        </button>
        <span className="flex items-center text-xs text-gray-500">
          ou créez votre propre espace ci-dessous
        </span>
      </div>
    </div>
  );
}
