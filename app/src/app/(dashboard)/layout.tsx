import { auth } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { PendingInvitationsBanner } from "@/features/invitations/components/pending-invitations-banner";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { getPendingInvitationsForUser } from "@/features/invitations/lib/invitations-admin";

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

  // Check for pending invitations (domain-scoped, not full realm scan)
  const userEmail = session.user.email ?? "";
  let pendingInvitations: Array<{ orgId: string; orgName: string; invitationId: string; role: string }> = [];
  if (userEmail) {
    try {
      pendingInvitations = await getPendingInvitationsForUser(userEmail, orgAliases);
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
        platformRole={session.platformRole}
      />
      <SidebarInset>
        <PendingInvitationsBanner invitations={pendingInvitations} />
        <div className="mx-auto max-w-5xl p-6 border border-border/50 shadow-sm rounded-lg">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
