import { Suspense } from "react";
import { auth } from "@/features/auth/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { PendingInvitationsLoader } from "@/features/invitations/components/pending-invitations-loader";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

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
        <Suspense fallback={null}>
          <PendingInvitationsLoader />
        </Suspense>
        <div className="mx-auto max-w-5xl p-6 border border-border/50 shadow-sm rounded-lg">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
