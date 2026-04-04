"use client";

import { acceptInvitation } from "@/features/invitations/actions/accept-invitation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function PendingInvitationsBanner({
  invitations,
}: {
  invitations: Array<{ orgId: string; orgName: string; invitationId: string; role: string }>;
}) {
  if (invitations.length === 0) return null;

  return (
    <div className="space-y-2 border-b px-6 py-3">
      {invitations.map((inv) => (
        <Alert key={inv.invitationId} className="flex items-center justify-between py-2">
          <form
            action={acceptInvitation}
            className="flex w-full items-center justify-between"
          >
            <input type="hidden" name="orgId" value={inv.orgId} />
            <input type="hidden" name="invitationId" value={inv.invitationId} />
            <AlertDescription>
              Vous êtes invité à rejoindre <strong>{inv.orgName}</strong>
              {" "}en tant que <strong>{inv.role}</strong>
            </AlertDescription>
            <Button type="submit" size="sm" className="ml-4 shrink-0">
              Accepter
            </Button>
          </form>
        </Alert>
      ))}
    </div>
  );
}
