import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET() {
  // Get idToken from session before destroying it
  const session = await auth();
  const idToken = (session as Record<string, unknown> | null)?.idToken as string | undefined;

  // Destroy NextAuth session cookies
  const cookieStore = await cookies();
  const cookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
    "authjs.csrf-token",
    "__Secure-authjs.csrf-token",
    "active-org",
  ];
  for (const name of cookieNames) {
    cookieStore.delete(name);
  }

  // Build KC logout URL
  const kcIssuer = process.env.KC_ISSUER!;
  const postLogoutUri = encodeURIComponent(process.env.NEXTAUTH_URL + "/login");
  const clientId = process.env.KC_CLIENT_ID!;

  let kcLogoutUrl = `${kcIssuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${postLogoutUri}&client_id=${clientId}`;

  // id_token_hint skips the KC logout confirmation page
  if (idToken) {
    kcLogoutUrl += `&id_token_hint=${idToken}`;
  }

  return NextResponse.redirect(kcLogoutUrl);
}
