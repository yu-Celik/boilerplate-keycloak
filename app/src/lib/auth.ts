import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";

// In-memory session store for backchannel logout
// ⚠️ WARNING: This Map is NOT shared across Edge isolates.
// In production, replace with a persistent store (Redis, Vercel KV, etc.)
// or backchannel logout will silently fail.
export const sessionStore = new Map<string, string>();

// KC_ISSUER = public URL (browser + iss validation): http://localhost:3991/realms/boilerplate
// KC_ISSUER_INTERNAL = Docker-internal URL (server fetches): http://keycloak:8080/realms/boilerplate
const KC_PUBLIC = process.env.KC_ISSUER!;
const KC_INTERNAL = process.env.KC_ISSUER_INTERNAL!;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const response = await fetch(
    `${KC_INTERNAL}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.KC_CLIENT_ID!,
        client_secret: process.env.KC_CLIENT_SECRET!,
        refresh_token: token.refreshToken as string,
      }),
    }
  );

  const refreshed = await response.json();

  if (!response.ok) {
    return { ...token, error: "RefreshTokenError" };
  }

  return {
    ...token,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token ?? token.refreshToken,
    accessTokenExpiresAt: Date.now() + refreshed.expires_in * 1000,
    idToken: refreshed.id_token ?? token.idToken,
  };
}

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  providers: [
    {
      id: "keycloak",
      name: "Keycloak",
      type: "oidc" as const,
      issuer: KC_PUBLIC,
      authorization: {
        url: `${KC_PUBLIC}/protocol/openid-connect/auth`,
        params: {
          scope: "openid profile email organization:*",
        },
      },
      token: {
        url: `${KC_INTERNAL}/protocol/openid-connect/token`,
      },
      userinfo: {
        url: `${KC_INTERNAL}/protocol/openid-connect/userinfo`,
      },
      jwks_endpoint: `${KC_INTERNAL}/protocol/openid-connect/certs`,
      clientId: process.env.KC_CLIENT_ID!,
      clientSecret: process.env.KC_CLIENT_SECRET!,
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub as string,
          name: (profile.name as string) ?? (profile.preferred_username as string),
          email: profile.email as string,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.accessTokenExpiresAt = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 300_000;

        if (account.providerAccountId) {
          sessionStore.set(account.providerAccountId, token.sub as string);
        }

        return token;
      }

      if (Date.now() < (token.accessTokenExpiresAt as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.error = token.error;
      // Store idToken for KC logout (id_token_hint to skip confirmation)
      (session as unknown as Record<string, unknown>).idToken = token.idToken;

      if (token.accessToken) {
        try {
          const payload = JSON.parse(
            Buffer.from(
              (token.accessToken as string).split(".")[1],
              "base64"
            ).toString()
          );

          // Populate user info from KC access token claims
          if (session.user) {
            session.user.id = payload.sub ?? token.sub ?? "";
            session.user.email = payload.email ?? token.email as string ?? "";
            session.user.name = payload.name ?? payload.preferred_username ?? token.name as string ?? "";
          }

          const org = payload.organization ?? null;
          session.organization = org;

          if (org && typeof org === "object" && Object.keys(org).length > 0) {
            const orgAliases = Object.keys(org);
            session.activeOrg = orgAliases[0];

            const activeOrgData = org[session.activeOrg];
            const groups: string[] = activeOrgData?.groups ?? [];
            if (groups.some((g: string) => g.includes("/Admin"))) {
              session.orgRole = "admin";
            } else if (groups.some((g: string) => g.includes("/Managers"))) {
              session.orgRole = "manager";
            } else {
              session.orgRole = "member";
            }
          }
        } catch {
          // Token parsing failed
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
