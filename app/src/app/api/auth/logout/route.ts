import { NextRequest, NextResponse } from "next/server";
import { signOut, auth } from "@/lib/auth";

// POST: Destroy NextAuth session AND return KC logout URL with id_token_hint
// The id_token never leaves the server — it's extracted here and returned as a URL only
export async function POST(request: NextRequest) {
  // CSRF: Verify Origin header
  const origin = request.headers.get("origin");
  const expectedOrigin = process.env.NEXTAUTH_URL
    ? new URL(process.env.NEXTAUTH_URL).origin
    : null;
  if (!origin || !expectedOrigin || origin !== expectedOrigin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Extract id_token BEFORE destroying the session
  const session = await auth();
  const idToken = (session as unknown as Record<string, unknown> | null)?.idToken as string | undefined;

  // Destroy NextAuth session
  try {
    await signOut({ redirect: false });
  } catch {
    // signOut may throw NEXT_REDIRECT — ignore
  }

  // Build KC logout URL server-side (id_token never sent to client directly)
  const kcIssuer = process.env.KC_ISSUER!;
  const params = new URLSearchParams({
    post_logout_redirect_uri: process.env.NEXTAUTH_URL + "/login",
    client_id: process.env.KC_CLIENT_ID!,
  });
  if (idToken) {
    params.set("id_token_hint", idToken);
  }

  return NextResponse.json({
    kcLogoutUrl: `${kcIssuer}/protocol/openid-connect/logout?${params.toString()}`,
  });
}
