"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

export function LoginRedirect() {
  useEffect(() => {
    signIn("keycloak", { callbackUrl: "/" });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Redirection...</p>
    </div>
  );
}
