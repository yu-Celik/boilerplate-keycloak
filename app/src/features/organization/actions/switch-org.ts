"use server";

import { cookies } from "next/headers";
import { auth } from "@/features/auth/lib/auth";

export async function switchOrg(alias: string) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Non authentifié");

  // Validate alias format — only allow __all__ or lowercase alphanumeric-dash
  if (alias !== "__all__" && !/^[a-z0-9][a-z0-9-]{0,62}$/.test(alias)) {
    throw new Error("Invalid organization alias");
  }

  // Verify user is actually a member of the target org
  if (alias !== "__all__") {
    const orgAliases = Object.keys(session.organization ?? {});
    if (!orgAliases.includes(alias)) {
      throw new Error("Accès refusé : vous n'êtes pas membre de cette organisation");
    }
  }

  const cookieStore = await cookies();
  cookieStore.set("active-org", alias, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}
