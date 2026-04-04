"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { addDomain, verifyDomain, removeDomain } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function SubmitButton({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "destructive" | "outline" }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size="sm"
      disabled={pending}
    >
      {pending ? "..." : children}
    </Button>
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
      <Card>
        <CardHeader>
          <CardTitle>Domaine</CardTitle>
          <CardDescription>
            Revendiquez votre domaine pour activer l&apos;auto-join et prouver que votre
            organisation est légitime.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <Input
                type="text"
                name="domain"
                placeholder="exemple.com"
                required
                className="flex-1"
              />
              <SubmitButton>Ajouter</SubmitButton>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">
              Seuls les administrateurs peuvent ajouter un domaine.
            </p>
          )}
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  // Domain exists
  return (
    <Card>
      <CardHeader>
        <CardTitle>Domaine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{domain}</span>
          {verified ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Vérifié
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Non vérifié
            </Badge>
          )}
        </div>

        {!verified && verifyToken && (
          <div className="space-y-3">
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
                  <SubmitButton variant="destructive">Supprimer</SubmitButton>
                </form>
              </div>
            )}
            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          </div>
        )}

        {verified && isAdmin && (
          <form action={removeDomain}>
            <SubmitButton variant="destructive">Supprimer le domaine</SubmitButton>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
