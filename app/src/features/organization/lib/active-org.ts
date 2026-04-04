import { auth } from "@/features/auth/lib/auth";
import { cookies } from "next/headers";
import { getOrgByAlias, getUserOrganizations } from "./organization-admin";
import { getUserByEmail } from "@/features/shared/lib/keycloak-user";

/**
 * Resolve the active organization ID from the cookie + session.
 * Returns null if "Tous" is selected or no org is found.
 */
export async function getActiveOrgId(): Promise<string | null> {
  const session = await auth();
  const organizations = session?.organization ?? {};
  const orgAliases = Object.keys(organizations);

  const cookieStore = await cookies();
  const rawActiveOrg = cookieStore.get("active-org")?.value;
  const activeOrg =
    rawActiveOrg === "__all__" ||
    (rawActiveOrg && orgAliases.includes(rawActiveOrg))
      ? rawActiveOrg
      : orgAliases[0] ?? "__all__";

  if (activeOrg === "__all__") return null;

  // Resolve org ID via KC admin API (session token doesn't include org IDs)
  const org = await getOrgByAlias(activeOrg).catch(() => null);
  return org?.id ?? null;
}

/**
 * Get all organization IDs the user belongs to.
 */
export async function getAllOrgIds(): Promise<string[]> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return [];

  const kcUser = await getUserByEmail(email).catch(() => null);
  if (!kcUser?.id) return [];

  const orgs = await getUserOrganizations(kcUser.id).catch(() => []);
  return orgs.map((o: { id: string }) => o.id).filter(Boolean);
}
