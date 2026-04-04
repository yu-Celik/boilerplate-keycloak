"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

export function LoginRedirect() {
  useEffect(() => {
    signIn("keycloak", { callbackUrl: "/" });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-3 w-48">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
