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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <TeamSwitcher
            organizations={organizations}
            activeOrg={activeOrg}
          />
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 px-3 text-xs text-muted-foreground">
            {session.user.email}
          </div>
          <LogoutButton kcLogoutUrl={(() => {
            const idToken = (session as unknown as Record<string, unknown>).idToken as string | undefined;
            const base = `${process.env.KC_ISSUER}/protocol/openid-connect/logout`;
            const params = new URLSearchParams({
              post_logout_redirect_uri: process.env.NEXTAUTH_URL + "/login",
              client_id: process.env.KC_CLIENT_ID!,
            });
            if (idToken) params.set("id_token_hint", idToken);
            return `${base}?${params.toString()}`;
          })()} />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl p-6">{children}</div>
      </main>
    </div>
  );
}
