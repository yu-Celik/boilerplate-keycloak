"use server";

import { cookies } from "next/headers";

export async function switchOrg(alias: string) {
  // M2: Validate alias format — only allow __all__ or lowercase alphanumeric-dash
  if (alias !== "__all__" && !/^[a-z0-9][a-z0-9-]{0,62}$/.test(alias)) {
    throw new Error("Invalid organization alias");
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
