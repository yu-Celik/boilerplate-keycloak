import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  // Get idToken from session before destroying it
  const session = await auth();
  const idToken = (session as unknown as Record<string, unknown> | null)?.idToken as string | undefined;

  // Build KC logout URL
  const kcIssuer = process.env.KC_ISSUER!;
  const postLogoutUri = encodeURIComponent(process.env.NEXTAUTH_URL + "/login");
  const clientId = process.env.KC_CLIENT_ID!;

  let kcLogoutUrl = `${kcIssuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${postLogoutUri}&client_id=${clientId}`;

  if (idToken) {
    kcLogoutUrl += `&id_token_hint=${idToken}`;
  }

  // Redirect to KC logout AND delete cookies in the same response
  const response = NextResponse.redirect(kcLogoutUrl);

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
    response.cookies.delete(name);
  }

  return response;
}
