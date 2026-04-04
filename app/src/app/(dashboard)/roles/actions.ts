"use server";

import { auth } from "@/features/auth/lib/auth";
import { getActiveOrgId } from "@/features/organization/lib/active-org";
import {
  getOrgGroups,
  listGroupMembers,
  addMemberToGroup,
  removeMemberFromGroup,
  assertOrgRole,
} from "@/features/members/lib/members-admin";
import { ORG_GROUPS, DEFAULT_GROUPS } from "@/features/shared/constants/org-groups";
import type { OrgGroupName } from "@/features/shared/constants/org-groups";
import { revalidatePath } from "next/cache";

export async function changeRole(userId: string, newRole: OrgGroupName) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Non authentifié");

  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("Aucune organisation sélectionnée");

  // Only Admins can change roles
  await assertOrgRole(orgId, session.user.email, [ORG_GROUPS.ADMIN]);

  // Validate the target role
  if (!DEFAULT_GROUPS.includes(newRole)) {
    throw new Error("Rôle invalide");
  }

  // Prevent self-demotion (admin can't remove their own Admin role)
  const { getUserByEmail } = await import("@/features/shared/lib/keycloak-user");
  const caller = await getUserByEmail(session.user.email);
  if (caller?.id === userId) {
    throw new Error("Vous ne pouvez pas modifier votre propre rôle");
  }

  const groups = await getOrgGroups(orgId);

  // Remove user from all current role groups
  const removePromises = groups
    .filter((g) => DEFAULT_GROUPS.includes(g.name as OrgGroupName))
    .map(async (g) => {
      const members = await listGroupMembers(orgId, g.id);
      if (members.some((m) => m.id === userId)) {
        await removeMemberFromGroup(orgId, g.id, userId);
      }
    });
  await Promise.all(removePromises);

  // Add to new role group
  const targetGroup = groups.find((g) => g.name === newRole);
  if (!targetGroup) throw new Error(`Groupe "${newRole}" introuvable`);
  await addMemberToGroup(orgId, targetGroup.id, userId);

  // Always ensure membership in Members group
  if (newRole !== ORG_GROUPS.MEMBERS) {
    const membersGroup = groups.find((g) => g.name === ORG_GROUPS.MEMBERS);
    if (membersGroup) {
      await addMemberToGroup(orgId, membersGroup.id, userId);
    }
  }

  revalidatePath("/roles");
  revalidatePath("/members");
}
