import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
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
      />
      <SidebarInset>
        <div className="mx-auto max-w-5xl p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
