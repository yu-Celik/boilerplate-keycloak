import { auth } from "@/lib/auth";
import {
  listOrgInvitations,
  sendOrgInvitation,
  listOrganizations,
} from "@/lib/keycloak-admin";
import { redirect } from "next/navigation";
import type { OrgInvitation } from "@/types";

async function getFirstOrgId() {
  try {
    const orgs = await listOrganizations();
    return orgs.length > 0 ? orgs[0].id : null;
  } catch {
    return null;
  }
}

export default async function InvitationsPage() {
  const session = await auth();
  const orgId = await getFirstOrgId();

  let invitations: OrgInvitation[] = [];
  if (orgId) {
    try {
      invitations = await listOrgInvitations(orgId);
    } catch {
      // Admin API may not be available
    }
  }

  async function handleInvite(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    if (!email || !orgId) return;

    try {
      await sendOrgInvitation(orgId, email);
    } catch (error) {
      console.error("Failed to send invitation:", error);
    }
    redirect("/invitations");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invitations</h1>
        <p className="text-muted-foreground">
          Invite collaborators to your organization
        </p>
      </div>

      {/* Invite form */}
      <form action={handleInvite} className="flex gap-3">
        <input
          type="email"
          name="email"
          placeholder="colleague@example.com"
          required
          className="flex-1 rounded-md border bg-background px-4 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Send Invitation
        </button>
      </form>

      {/* Invitations list */}
      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Sent
              </th>
            </tr>
          </thead>
          <tbody>
            {invitations.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No invitations sent yet
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
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(inv.createdTimestamp).toLocaleDateString()}
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
