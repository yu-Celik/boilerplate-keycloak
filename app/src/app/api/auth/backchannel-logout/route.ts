import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { sessionStore } from "@/features/auth/lib/auth";

let cachedJWKS: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!cachedJWKS) {
    cachedJWKS = createRemoteJWKSet(
      new URL(`${process.env.KC_ISSUER_INTERNAL!}/protocol/openid-connect/certs`)
    );
  }
  return cachedJWKS;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const logoutToken = formData.get("logout_token");

    if (!logoutToken || typeof logoutToken !== "string") {
      return NextResponse.json(
        { error: "Missing logout_token" },
        { status: 400 }
      );
    }

    // SECURITY: Verify JWT signature against Keycloak's JWKS
    const { payload } = await jwtVerify(logoutToken, getJWKS(), {
      issuer: process.env.KC_ISSUER!,
      audience: process.env.KC_CLIENT_ID!,
    });

    const sid = payload.sid as string | undefined;
    const sub = payload.sub as string | undefined;

    if (sid) {
      sessionStore.delete(sid);
    }
    if (sub) {
      sessionStore.delete(sub);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Backchannel logout error:", error);
    return NextResponse.json(
      { error: "Invalid or expired logout token" },
      { status: 400 }
    );
  }
}
