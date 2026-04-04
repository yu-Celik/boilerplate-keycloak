"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Erreur critique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || "Erreur inattendue. Veuillez réessayer."}
          </p>
          <Button onClick={reset}>Réessayer</Button>
        </CardContent>
      </Card>
    </div>
  );
}
