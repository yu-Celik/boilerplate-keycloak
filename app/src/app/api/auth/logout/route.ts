import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  // Destroy NextAuth session by deleting session cookies
  const cookieStore = await cookies();
  const sessionCookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
    "authjs.csrf-token",
    "__Secure-authjs.csrf-token",
    "active-org",
  ];
  for (const name of sessionCookieNames) {
    cookieStore.delete(name);
  }

  // Redirect to KC logout endpoint (destroys KC session too)
  const kcIssuer = process.env.KC_ISSUER!;
  const postLogoutUri = encodeURIComponent(process.env.NEXTAUTH_URL + "/login");
  const clientId = process.env.KC_CLIENT_ID!;
  const kcLogoutUrl = `${kcIssuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${postLogoutUri}&client_id=${clientId}`;

  return NextResponse.redirect(kcLogoutUrl);
}
