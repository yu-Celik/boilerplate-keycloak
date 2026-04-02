import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "authjs.callback-url",
  "__Secure-authjs.callback-url",
  "authjs.csrf-token",
  "__Secure-authjs.csrf-token",
  "active-org",
];

// POST: Just delete cookies (called from client before KC redirect)
export async function POST() {
  const cookieStore = await cookies();
  for (const name of COOKIE_NAMES) {
    cookieStore.delete(name);
  }
  return NextResponse.json({ ok: true });
}

// GET: Fallback — delete cookies and redirect to KC logout
export async function GET() {
  const kcIssuer = process.env.KC_ISSUER!;
  const postLogoutUri = encodeURIComponent(process.env.NEXTAUTH_URL + "/login");
  const clientId = process.env.KC_CLIENT_ID!;
  const kcLogoutUrl = `${kcIssuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${postLogoutUri}&client_id=${clientId}`;

  const response = NextResponse.redirect(kcLogoutUrl);
  for (const name of COOKIE_NAMES) {
    response.cookies.delete(name);
  }
  return response;
}
