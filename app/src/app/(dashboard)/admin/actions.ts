"use server";

import { auth } from "@/features/auth/lib/auth";
import { setOrganizationEnabled } from "@/features/admin/lib/platform-admin";
import { revalidatePath } from "next/cache";

async function assertPlatformAdmin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Non authentifié");
  if (session.platformRole !== "platform-admin") {
    throw new Error("Access denied");
  }
}

export async function suspendOrg(orgId: string) {
  await assertPlatformAdmin();
  await setOrganizationEnabled(orgId, false);
  revalidatePath("/admin");
}

export async function reactivateOrg(orgId: string) {
  await assertPlatformAdmin();
  await setOrganizationEnabled(orgId, true);
  revalidatePath("/admin");
}
