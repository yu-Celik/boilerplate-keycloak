"use server";

import { cookies } from "next/headers";

export async function switchOrg(alias: string) {
  const cookieStore = await cookies();
  cookieStore.set("active-org", alias, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}
