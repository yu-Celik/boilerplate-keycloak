"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { addDomain, verifyDomain, removeDomain } from "./actions";

function SubmitButton({ children, variant = "primary" }: { children: React.ReactNode; variant?: "primary" | "danger" | "outline" }) {
  const { pending } = useFormStatus();
  const styles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    danger: "border border-destructive text-destructive hover:bg-destructive/10",
    outline: "border hover:bg-muted",
  };
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium disabled:opacity-50 ${styles[variant]}`}
    >
      {pending ? "..." : children}
    </button>
  );
}

export function DomainManager({
  domain,
  verified,
  verifyToken,
  isAdmin,
}: {
  domain: string | null;
  verified: boolean;
  verifyToken: string | null;
  isAdmin: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  if (!domain) {
    // No domain configured — show add form
    return (
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold">Domaine</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Revendiquez votre domaine pour activer l&apos;auto-join et prouver que votre
          organisation est légitime.
        </p>
        {isAdmin ? (
          <form
            action={async (formData) => {
              setError(null);
              try {
                await addDomain(formData);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              name="domain"
              placeholder="exemple.com"
              required
              className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm"
            />
            <SubmitButton>Ajouter</SubmitButton>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground">
            Seuls les administrateurs peuvent ajouter un domaine.
          </p>
        )}
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  // Domain exists
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-2 text-lg font-semibold">Domaine</h2>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{domain}</span>
        {verified ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
            Vérifié
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Non vérifié
          </span>
        )}
      </div>

      {!verified && verifyToken && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Ajoutez cet enregistrement DNS TXT à votre domaine :
          </p>
          <code className="block rounded-md bg-muted p-3 text-xs font-mono">
            keycloak-verify={verifyToken}
          </code>
          <p className="text-xs text-muted-foreground">
            La propagation DNS peut prendre jusqu&apos;à 48h.
          </p>
          {isAdmin && (
            <div className="flex gap-2">
              <form
                action={async () => {
                  setError(null);
                  try {
                    await verifyDomain();
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                <SubmitButton>Vérifier maintenant</SubmitButton>
              </form>
              <form action={removeDomain}>
                <SubmitButton variant="danger">Supprimer</SubmitButton>
              </form>
            </div>
          )}
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </div>
      )}

      {verified && isAdmin && (
        <div className="mt-4">
          <form action={removeDomain}>
            <SubmitButton variant="danger">Supprimer le domaine</SubmitButton>
          </form>
        </div>
      )}
    </div>
  );
}
