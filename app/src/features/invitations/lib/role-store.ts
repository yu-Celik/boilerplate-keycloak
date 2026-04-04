import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Lightweight file-based store for invitation role mappings.
 * Keycloak's invite-user API does not support a role/group parameter,
 * so we persist the chosen role here between invitation send and acceptance.
 *
 * Entries include a timestamp and are cleaned up after 30 days.
 * Production: replace with a database table.
 */

const DATA_DIR = join(process.cwd(), "data");
const STORE_PATH = join(DATA_DIR, "invitation-roles.json");
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface RoleEntry {
  role: string;
  createdAt: number;
}

type RoleStore = Record<string, string | RoleEntry>;

function makeKey(orgId: string, email: string): string {
  return `${orgId}:${email.toLowerCase()}`;
}

function parseEntry(value: string | RoleEntry): { role: string; createdAt: number } {
  // Backward compat: old entries are plain strings
  if (typeof value === "string") return { role: value, createdAt: Date.now() };
  return value;
}

function cleanupExpired(store: RoleStore): RoleStore {
  const now = Date.now();
  const cleaned: RoleStore = {};
  for (const [key, value] of Object.entries(store)) {
    const { createdAt } = parseEntry(value);
    if (now - createdAt < TTL_MS) {
      cleaned[key] = value;
    }
  }
  return cleaned;
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
  const cleaned = cleanupExpired(store);
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(cleaned, null, 2), "utf-8");
}

export async function saveInvitationRole(
  orgId: string,
  email: string,
  role: string
): Promise<void> {
  const store = await readStore();
  store[makeKey(orgId, email)] = { role, createdAt: Date.now() };
  await writeStore(store);
}

export async function getInvitationRole(
  orgId: string,
  email: string
): Promise<string | null> {
  const store = await readStore();
  const entry = store[makeKey(orgId, email)];
  if (!entry) return null;
  return parseEntry(entry).role;
}

export async function getInvitationRolesBatch(
  keys: Array<{ orgId: string; email: string }>
): Promise<Map<string, string>> {
  const store = await readStore();
  const result = new Map<string, string>();
  for (const { orgId, email } of keys) {
    const entry = store[makeKey(orgId, email)];
    if (entry) result.set(makeKey(orgId, email), parseEntry(entry).role);
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
