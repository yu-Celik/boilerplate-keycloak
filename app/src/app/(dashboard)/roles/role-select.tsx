"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORG_GROUPS } from "@/features/shared/constants/org-groups";
import type { OrgGroupName } from "@/features/shared/constants/org-groups";
import { changeRole } from "./actions";

const ROLE_OPTIONS: { value: OrgGroupName; label: string }[] = [
  { value: ORG_GROUPS.ADMIN, label: "Admin" },
  { value: ORG_GROUPS.MANAGERS, label: "Manager" },
  { value: ORG_GROUPS.MEMBERS, label: "Membre" },
];

interface RoleSelectProps {
  userId: string;
  currentRole: OrgGroupName;
  isSelf: boolean;
}

export function RoleSelect({ userId, currentRole, isSelf }: RoleSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(value: string) {
    setError(null);
    startTransition(async () => {
      try {
        await changeRole(userId, value as OrgGroupName);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inconnue");
      }
    });
  }

  return (
    <div className="space-y-1">
      <Select
        defaultValue={currentRole}
        onValueChange={handleChange}
        disabled={isPending || isSelf}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
