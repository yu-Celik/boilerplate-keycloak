"use client"

import {
  LayoutDashboard,
  Users,
  Mail,
  Shield,
  ShieldCheck,
  Settings,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/features/organization/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Membres",
    url: "/members",
    icon: Users,
  },
  {
    title: "Invitations",
    url: "/invitations",
    icon: Mail,
  },
  {
    title: "Rôles",
    url: "/roles",
    icon: Shield,
  },
  {
    title: "Paramètres",
    url: "/settings",
    icon: Settings,
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  organizations: Record<string, { id: string; groups?: string[] }>
  activeOrg?: string
  user: {
    name: string
    email: string
  }
  platformRole?: "platform-admin"
}

export function AppSidebar({ organizations, activeOrg, user, platformRole, ...props }: AppSidebarProps) {
  const items = platformRole === "platform-admin"
    ? [...navItems, { title: "Admin", url: "/admin", icon: ShieldCheck }]
    : navItems

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          organizations={organizations}
          activeOrg={activeOrg}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
