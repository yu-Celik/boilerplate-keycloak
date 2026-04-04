"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Erreur critique</h1>
          <p className="text-muted-foreground">
            {error.message || "Une erreur inattendue est survenue."}
          </p>
          <Button onClick={reset}>Réessayer</Button>
        </div>
      </body>
    </html>
  );
}
