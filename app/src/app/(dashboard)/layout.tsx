import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Mail,
  Shield,
  Settings,
  Contact,
  SquareCheck,
} from "lucide-react";
import { TeamSwitcher } from "@/components/team-switcher";
import { LogoutButton } from "@/components/logout-button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Membres", icon: Users },
  { href: "/invitations", label: "Invitations", icon: Mail },
  { href: "/contacts", label: "Contacts", icon: Contact },
  { href: "/tasks", label: "Tâches", icon: SquareCheck },
  { href: "/roles", label: "Rôles", icon: Shield },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

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
      <Sidebar>
        <SidebarHeader>
          <TeamSwitcher
            organizations={organizations}
            activeOrg={activeOrg}
          />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href + item.label}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="px-2 py-1 text-xs text-muted-foreground">
            {session.user.email}
          </div>
          <LogoutButton />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="mx-auto max-w-5xl p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
