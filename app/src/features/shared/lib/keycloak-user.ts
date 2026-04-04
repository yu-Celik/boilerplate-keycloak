import type { OrgMember } from "@/features/members/types";
import { adminFetch } from "./keycloak-client";

export async function getUserByEmail(email: string): Promise<OrgMember | null> {
  const res = await adminFetch(`/users?email=${encodeURIComponent(email)}&exact=true`);
  if (!res.ok) throw new Error(`Failed to search user by email: ${res.status}`);
  const users = (await res.json()) as OrgMember[];
  return users[0] ?? null;
}
