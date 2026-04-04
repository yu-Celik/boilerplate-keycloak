import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  } catch {
    return null;
  }
}

// In-memory session store for backchannel logout
// ⚠️ WARNING: This Map is NOT shared across Edge isolates.
// In production, replace with a persistent store (Redis, Vercel KV, etc.)
// or backchannel logout will silently fail.
export const sessionStore = new Map<string, string>();

if (process.env.NODE_ENV === "production") {
  console.warn(
    "[auth] ⚠️ Using in-memory sessionStore. Backchannel logout will NOT work across multiple instances. Replace with Redis/KV."
  );
}

// KC_ISSUER = public URL (browser + iss validation): http://localhost:3991/realms/boilerplate
// KC_ISSUER_INTERNAL = Docker-internal URL (server fetches): http://keycloak:8080/realms/boilerplate
const KC_PUBLIC = process.env.KC_ISSUER!;
const KC_INTERNAL = process.env.KC_ISSUER_INTERNAL!;

// Mutex to prevent concurrent refresh token requests (Next.js SSR can
// trigger multiple parallel auth() calls that all see an expired token).
let refreshPromise: Promise<JWT> | null = null;

async function doRefresh(token: JWT): Promise<JWT> {
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

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = doRefresh(token).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  trustHost: true,
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

        // Detect platform-admin realm role from the KC id_token
        const idPayload = parseJwtPayload(account.id_token as string);
        const realmRoles: string[] = idPayload?.realm_access?.roles ?? [];
        token.platformRole = realmRoles.includes("platform-admin") ? "platform-admin" : undefined;

        return token;
      }

      if (Date.now() < (token.accessTokenExpiresAt as number)) {
        return token;
      }

      const refreshed = await refreshAccessToken(token);

      // Re-detect platform-admin from refreshed id_token
      if (refreshed.idToken && !refreshed.error) {
        const idPayload = parseJwtPayload(refreshed.idToken as string);
        const realmRoles: string[] = idPayload?.realm_access?.roles ?? [];
        refreshed.platformRole = realmRoles.includes("platform-admin") ? "platform-admin" : undefined;
      }

      return refreshed;
    },
    async session({ session, token }) {
      session.error = token.error;
      session.platformRole = token.platformRole;
      // idToken for KC logout (id_token_hint skips confirmation page)
      // Only accessible server-side via auth() — NOT serialized to client useSession()
      (session as unknown as Record<string, unknown>).idToken = token.idToken;

      if (token.accessToken) {
        const payload = parseJwtPayload(token.accessToken as string);
        if (payload) {
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

            // Derive orgRole from the active org cookie (not always the first alias)
            // Read the cookie to determine which org is actually selected
            const { cookies } = await import("next/headers");
            let resolvedAlias = orgAliases[0];
            try {
              const cookieStore = await cookies();
              const rawActiveOrg = cookieStore.get("active-org")?.value;
              if (rawActiveOrg && rawActiveOrg !== "__all__" && orgAliases.includes(rawActiveOrg)) {
                resolvedAlias = rawActiveOrg;
              }
            } catch {
              // cookies() may not be available in all contexts (e.g., API routes)
            }

            const activeOrgData = org[resolvedAlias];
            const groups: string[] = activeOrgData?.groups ?? [];
            if (groups.some((g: string) => g.includes("/Admin"))) {
              session.orgRole = "admin";
            } else if (groups.some((g: string) => g.includes("/Managers"))) {
              session.orgRole = "manager";
            } else {
              session.orgRole = "member";
            }
          }
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
