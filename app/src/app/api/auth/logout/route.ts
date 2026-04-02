import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Step 2: If we already have the KC logout URL, just redirect
  const kcUrl = searchParams.get("kc");
  if (kcUrl) {
    return NextResponse.redirect(kcUrl);
  }

  // Step 1: Get idToken, delete cookies, redirect back to ourselves with KC URL
  const session = await auth();
  const idToken = (session as unknown as Record<string, unknown> | null)?.idToken as string | undefined;

  const kcIssuer = process.env.KC_ISSUER!;
  const postLogoutUri = encodeURIComponent(process.env.NEXTAUTH_URL + "/login");
  const clientId = process.env.KC_CLIENT_ID!;

  let kcLogoutUrl = `${kcIssuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${postLogoutUri}&client_id=${clientId}`;
  if (idToken) {
    kcLogoutUrl += `&id_token_hint=${idToken}`;
  }

  // Redirect to self with KC URL param — cookies are deleted on THIS response (same origin)
  const selfUrl = new URL("/api/auth/logout", process.env.NEXTAUTH_URL!);
  selfUrl.searchParams.set("kc", kcLogoutUrl);

  const response = NextResponse.redirect(selfUrl);

  // Delete cookies on same-origin redirect (this works)
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
