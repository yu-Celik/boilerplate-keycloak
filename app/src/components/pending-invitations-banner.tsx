"use client";

import { acceptInvitation } from "@/app/(dashboard)/accept-invitation-action";

export function PendingInvitationsBanner({
  invitations,
}: {
  invitations: Array<{ orgId: string; orgName: string; invitationId: string; role: string }>;
}) {
  if (invitations.length === 0) return null;

  return (
    <div className="space-y-2 border-b bg-green-50 px-6 py-3 dark:bg-green-950">
      {invitations.map((inv) => (
        <form
          key={inv.invitationId}
          action={acceptInvitation}
          className="flex items-center justify-between"
        >
          <input type="hidden" name="orgId" value={inv.orgId} />
          <input type="hidden" name="invitationId" value={inv.invitationId} />
          <p className="text-sm text-green-800 dark:text-green-200">
            Vous êtes invité à rejoindre <strong>{inv.orgName}</strong>
            {" "}en tant que <strong>{inv.role}</strong>
          </p>
          <button
            type="submit"
            className="inline-flex h-7 items-center rounded-md bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-700"
          >
            Accepter
          </button>
        </form>
      ))}
    </div>
  );
}
