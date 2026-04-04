const KC_INTERNAL = process.env.KC_ISSUER_INTERNAL || "http://keycloak:8080/realms/boilerplate";
const KC_BASE = KC_INTERNAL.replace("/realms/boilerplate", "");

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getServiceAccountToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const response = await fetch(
    `${KC_INTERNAL}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.KC_SERVICE_ACCOUNT_CLIENT_ID!,
        client_secret: process.env.KC_SERVICE_ACCOUNT_CLIENT_SECRET!,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Service account auth failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 30) * 1000,
  };

  return cachedToken.token;
}

export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getServiceAccountToken();
  return fetch(`${KC_BASE}/admin/realms/boilerplate${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
