"use client";

import { useFormStatus } from "react-dom";
import { toggleAutoJoin } from "./actions";

function ToggleButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50 ${
        enabled ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

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
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-2 text-lg font-semibold">Auto-join</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Les utilisateurs avec un email correspondant au domaine vérifié de
        l&apos;organisation peuvent la rejoindre automatiquement.
      </p>

      <div className="flex items-center gap-3">
        {isAdmin && canToggle ? (
          <form action={toggleAutoJoin}>
            <ToggleButton enabled={enabled} />
          </form>
        ) : (
          <span
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent opacity-50 ${
              enabled ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </span>
        )}
        <span className="text-sm font-medium">
          {enabled ? "Activé" : "Désactivé"}
        </span>
      </div>

      {!hasVerifiedDomain && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
          Vérifiez un domaine pour activer l&apos;auto-join.
        </p>
      )}
      {!isAdmin && (
        <p className="mt-3 text-xs text-muted-foreground">
          Seuls les administrateurs peuvent modifier ce paramètre.
        </p>
      )}
    </div>
  );
}
