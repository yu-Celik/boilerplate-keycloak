import { NextResponse } from "next/server";
import { signOut, auth } from "@/lib/auth";

// POST: Destroy NextAuth session (called from LogoutButton before KC redirect)
export async function POST() {
  try {
    await signOut({ redirect: false });
  } catch {
    // signOut may throw NEXT_REDIRECT — ignore
  }
  return NextResponse.json({ ok: true });
}

// GET: Get KC logout URL with id_token_hint (called from LogoutButton)
export async function GET() {
  const session = await auth();
  const idToken = (session as unknown as Record<string, unknown> | null)?.idToken as string | undefined;

  const kcIssuer = process.env.KC_ISSUER!;
  const postLogoutUri = encodeURIComponent(process.env.NEXTAUTH_URL + "/login");
  const clientId = process.env.KC_CLIENT_ID!;

  let kcLogoutUrl = `${kcIssuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${postLogoutUri}&client_id=${clientId}`;
  if (idToken) {
    kcLogoutUrl += `&id_token_hint=${idToken}`;
  }

  return NextResponse.json({ kcLogoutUrl });
}
