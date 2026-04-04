"use server";

import { auth } from "@/features/auth/lib/auth";
import { getActiveOrgId } from "@/features/organization/lib/active-org";
import { getOrganization, updateOrganization } from "@/features/organization/lib/organization-admin";
import { assertOrgRole } from "@/features/members/lib/members-admin";
import { ORG_GROUPS } from "@/features/shared/constants/org-groups";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { resolveTxt } from "node:dns/promises";

export async function toggleAutoJoin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Non authentifié");

  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("Aucune organisation sélectionnée");

  await assertOrgRole(orgId, session.user.email, [ORG_GROUPS.ADMIN]);

  const org = await getOrganization(orgId);
  const currentValue = org.attributes?.autoJoin?.[0] === "true";

  await updateOrganization(orgId, {
    attributes: {
      ...org.attributes,
      autoJoin: [currentValue ? "false" : "true"],
    },
  });

  revalidatePath("/settings");
}

export async function addDomain(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Non authentifié");

  const domain = (formData.get("domain") as string)?.trim().toLowerCase();
  if (!domain || !domain.includes(".")) throw new Error("Domaine invalide");

  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("Aucune organisation sélectionnée");

  await assertOrgRole(orgId, session.user.email, [ORG_GROUPS.ADMIN]);

  const org = await getOrganization(orgId);

  // Check if org already has a domain
  if (org.domains && org.domains.length > 0) {
    throw new Error("Un domaine est déjà configuré");
  }

  // Generate verification token
  const verifyToken = randomUUID();

  await updateOrganization(orgId, {
    attributes: {
      ...org.attributes,
      domainVerifyToken: [verifyToken],
    },
  });

  // Add domain as unverified — need to use the full org update
  const updatedOrg = await getOrganization(orgId);
  await updateOrganization(orgId, {
    ...updatedOrg,
    domains: [{ name: domain, verified: false }],
  });

  revalidatePath("/settings");
}

export async function verifyDomain() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Non authentifié");

  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("Aucune organisation sélectionnée");

  await assertOrgRole(orgId, session.user.email, [ORG_GROUPS.ADMIN]);

  const org = await getOrganization(orgId);
  const domain = org.domains?.[0];
  if (!domain) throw new Error("Aucun domaine configuré");
  if (domain.verified) throw new Error("Domaine déjà vérifié");

  const expectedToken = org.attributes?.domainVerifyToken?.[0];
  if (!expectedToken) throw new Error("Token de vérification manquant");

  // Check DNS TXT records
  let txtRecords: string[][];
  try {
    txtRecords = await resolveTxt(domain.name);
  } catch {
    throw new Error("Impossible de résoudre les enregistrements DNS TXT");
  }

  const found = txtRecords
    .flat()
    .some((txt) => txt === `keycloak-verify=${expectedToken}`);

  if (!found) {
    throw new Error(
      `Enregistrement DNS TXT de vérification introuvable pour ${domain.name}. Consultez les paramètres pour le token attendu.`
    );
  }

  // Mark domain as verified
  await updateOrganization(orgId, {
    ...org,
    domains: [{ name: domain.name, verified: true }],
  });

  revalidatePath("/settings");
}

export async function removeDomain() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Non authentifié");

  const orgId = await getActiveOrgId();
  if (!orgId) throw new Error("Aucune organisation sélectionnée");

  await assertOrgRole(orgId, session.user.email, [ORG_GROUPS.ADMIN]);

  const org = await getOrganization(orgId);

  await updateOrganization(orgId, {
    ...org,
    domains: [],
    attributes: {
      ...org.attributes,
      domainVerifyToken: [],
      autoJoin: ["false"],
    },
  });

  revalidatePath("/settings");
}
