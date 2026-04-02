"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, Plus, Building2, LayoutGrid, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { switchOrg } from "@/app/(dashboard)/actions";

interface TeamSwitcherProps {
  organizations: Record<string, { id: string; groups?: string[] }>;
  activeOrg?: string;
}

export function TeamSwitcher({ organizations, activeOrg }: TeamSwitcherProps) {
  const [currentOrg, setCurrentOrg] = useState(activeOrg);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const orgEntries = Object.entries(organizations).map(
    ([alias, data]) => ({ alias, ...data })
  );

  function handleSwitch(alias: string) {
    setCurrentOrg(alias);
    startTransition(async () => {
      await switchOrg(alias);
      router.refresh();
    });
  }

  const currentLabel =
    currentOrg === "__all__"
      ? "Tous"
      : currentOrg ?? orgEntries[0]?.alias ?? "Boilerplate";

  const CurrentIcon = currentOrg === "__all__" ? LayoutGrid : Building2;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <CurrentIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{currentLabel}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {orgEntries.length} organisation{orgEntries.length > 1 ? "s" : ""}
                </span>
              </div>
              {isPending ? (
                <Loader2 className="ml-auto size-4 animate-spin" />
              ) : (
                <ChevronsUpDown className="ml-auto size-4" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organisations
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleSwitch("__all__")}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-sm border">
                <LayoutGrid className="size-4 shrink-0" />
              </div>
              Tous
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {orgEntries.map((org) => (
              <DropdownMenuItem
                key={org.alias}
                onClick={() => handleSwitch(org.alias)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Building2 className="size-4 shrink-0" />
                </div>
                {org.alias}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => router.push("/onboarding")}
            >
              <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Créer une organisation
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
