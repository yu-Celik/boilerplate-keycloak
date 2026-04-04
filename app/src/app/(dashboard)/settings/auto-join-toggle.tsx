"use client";

import { toggleAutoJoin } from "./actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AutoJoinToggle({
  enabled,
  canToggle,
  hasVerifiedDomain,
  isAdmin,
}: {
  enabled: boolean;
  canToggle: boolean;
  hasVerifiedDomain: boolean;
  isAdmin: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto-join</CardTitle>
        <CardDescription>
          Les utilisateurs avec un email correspondant au domaine vérifié de
          l&apos;organisation peuvent la rejoindre automatiquement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          {isAdmin && canToggle ? (
            <form action={toggleAutoJoin} className="flex items-center gap-3">
              <Switch
                type="submit"
                id="auto-join-toggle"
                defaultChecked={enabled}
                aria-label={enabled ? "Désactiver l'auto-join" : "Activer l'auto-join"}
              />
              <Label htmlFor="auto-join-toggle" className="text-sm font-medium cursor-pointer">
                {enabled ? "Activé" : "Désactivé"}
              </Label>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <Switch
                id="auto-join-display"
                checked={enabled}
                disabled
                aria-label={enabled ? "Auto-join activé" : "Auto-join désactivé"}
              />
              <Label htmlFor="auto-join-display" className="text-sm font-medium">
                {enabled ? "Activé" : "Désactivé"}
              </Label>
            </div>
          )}
        </div>

        {!hasVerifiedDomain && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Vérifiez un domaine pour activer l&apos;auto-join.
          </p>
        )}
        {!isAdmin && (
          <p className="text-xs text-muted-foreground">
            Seuls les administrateurs peuvent modifier ce paramètre.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
