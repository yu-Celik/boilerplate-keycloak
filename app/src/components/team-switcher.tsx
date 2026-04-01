"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Building2, LayoutGrid, Loader2 } from "lucide-react";
import Link from "next/link";
import { switchOrg } from "@/app/(dashboard)/actions";

interface TeamSwitcherProps {
  organizations: Record<string, { id: string; groups?: string[] }>;
  activeOrg?: string;
}

export function TeamSwitcher({ organizations, activeOrg }: TeamSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [currentOrg, setCurrentOrg] = useState(activeOrg);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const orgEntries = Object.entries(organizations).map(
    ([alias, data]) => ({ alias, ...data })
  );

  // Single-org user: just show the org name, no dropdown
  if (orgEntries.length <= 1 && currentOrg !== "__all__") {
    const org = orgEntries[0];
    return (
      <div className="flex items-center gap-2 px-1">
        <Building2 className="h-4 w-4 text-sidebar-foreground/70" />
        <span className="text-sm font-semibold text-sidebar-foreground">
          {org?.alias ?? "Boilerplate"}
        </span>
      </div>
    );
  }

  function handleSwitch(alias: string) {
    setOpen(false);
    setCurrentOrg(alias); // Instant UI update
    startTransition(async () => {
      await switchOrg(alias); // Secure httpOnly cookie via server action
      router.refresh(); // Server re-render in background
    });
  }

  const currentLabel =
    currentOrg === "__all__"
      ? "Tous"
      : currentOrg ?? orgEntries[0]?.alias ?? "Boilerplate";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-accent"
      >
        <span className="flex items-center gap-2">
          {currentOrg === "__all__" ? (
            <LayoutGrid className="h-4 w-4" />
          ) : (
            <Building2 className="h-4 w-4" />
          )}
          {currentLabel}
          {isPending && <Loader2 className="h-3 w-3 animate-spin opacity-50" />}
        </span>
        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[200px] rounded-md border border-sidebar-border bg-sidebar shadow-lg">
          <button
            onClick={() => handleSwitch("__all__")}
            className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-sidebar-accent ${
              currentOrg === "__all__"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Tous
          </button>

          <div className="my-1 border-t border-sidebar-border" />

          {orgEntries.map((org) => (
            <button
              key={org.alias}
              onClick={() => handleSwitch(org.alias)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-sidebar-accent ${
                currentOrg === org.alias
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground"
              }`}
            >
              <Building2 className="h-4 w-4" />
              {org.alias}
            </button>
          ))}

          <div className="my-1 border-t border-sidebar-border" />

          <Link
            href="/onboarding"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Plus className="h-4 w-4" />
            Créer une organisation
          </Link>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
