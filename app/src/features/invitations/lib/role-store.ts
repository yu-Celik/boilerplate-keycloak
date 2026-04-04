import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Lightweight file-based store for invitation role mappings.
 * Keycloak's invite-user API does not support a role/group parameter,
 * so we persist the chosen role here between invitation send and acceptance.
 *
 * Production: replace with a database table.
 */

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "invitation-roles.json");

type RoleStore = Record<string, string>;

function makeKey(orgId: string, email: string): string {
  return `${orgId}:${email.toLowerCase()}`;
}

async function readStore(): Promise<RoleStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as RoleStore;
  } catch {
    return {};
  }
}

async function writeStore(store: RoleStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function saveInvitationRole(
  orgId: string,
  email: string,
  role: string
): Promise<void> {
  const store = await readStore();
  store[makeKey(orgId, email)] = role;
  await writeStore(store);
}

export async function getInvitationRole(
  orgId: string,
  email: string
): Promise<string | null> {
  const store = await readStore();
  return store[makeKey(orgId, email)] ?? null;
}

export async function getInvitationRolesBatch(
  keys: Array<{ orgId: string; email: string }>
): Promise<Map<string, string>> {
  const store = await readStore();
  const result = new Map<string, string>();
  for (const { orgId, email } of keys) {
    const role = store[makeKey(orgId, email)];
    if (role) result.set(makeKey(orgId, email), role);
  }
  return result;
}

export async function deleteInvitationRole(
  orgId: string,
  email: string
): Promise<void> {
  const store = await readStore();
  const key = makeKey(orgId, email);
  if (key in store) {
    delete store[key];
    await writeStore(store);
  }
}
