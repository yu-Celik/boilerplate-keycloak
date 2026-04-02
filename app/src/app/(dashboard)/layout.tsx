import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { PendingInvitationsBanner } from "@/components/pending-invitations-banner";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { listOrganizations, listOrgInvitations } from "@/lib/keycloak-admin";
import type { OrgInvitation } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const organizations = session.organization ?? {};
  const orgAliases = Object.keys(organizations);
  const cookieStore = await cookies();
  const rawActiveOrg = cookieStore.get("active-org")?.value;
  const activeOrg = (rawActiveOrg === "__all__" || (rawActiveOrg && orgAliases.includes(rawActiveOrg)))
    ? rawActiveOrg
    : orgAliases[0] ?? "__all__";

  // Check for pending invitations for this user
  const userEmail = session.user.email ?? "";
  let pendingInvitations: Array<{ orgId: string; orgName: string; invitationId: string }> = [];
  if (userEmail) {
    try {
      const allOrgs = await listOrganizations();
      for (const org of allOrgs) {
        // Skip orgs the user is already a member of
        if (orgAliases.includes(org.alias)) continue;
        const invitations: OrgInvitation[] = await listOrgInvitations(org.id).catch(() => []);
        const matching = invitations.filter(
          (inv) => inv.email === userEmail && inv.status === "PENDING"
        );
        for (const inv of matching) {
          pendingInvitations.push({ orgId: org.id, orgName: org.name, invitationId: inv.id });
        }
      }
    } catch {
      // non-critical
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar
        organizations={organizations}
        activeOrg={activeOrg}
        user={{
          name: session.user.name ?? "",
          email: session.user.email ?? "",
        }}
      />
      <SidebarInset>
        <PendingInvitationsBanner invitations={pendingInvitations} />
        <div className="mx-auto max-w-5xl p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
