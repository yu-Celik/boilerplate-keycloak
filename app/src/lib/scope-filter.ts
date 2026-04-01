import type { OrgRole } from "@/types";

export interface ScopeContext {
  activeOrg: string; // org alias or "__all__"
  userId: string;
  userRole: OrgRole;
  userOrgIds: string[]; // all org IDs the user belongs to
}

export interface ScopeFilter {
  orgIds: string[];
  assignedTo?: string; // only set for non-manager/admin roles
}

export function buildScopeFilter(ctx: ScopeContext): ScopeFilter {
  const isAllOrgs = ctx.activeOrg === "__all__";
  // SECURITY: Validate activeOrg is in the user's actual org list
  // Prevents cookie manipulation to access other tenants' data
  const orgIds = isAllOrgs
    ? ctx.userOrgIds
    : ctx.userOrgIds.includes(ctx.activeOrg)
      ? [ctx.activeOrg]
      : ctx.userOrgIds;

  // Admins and managers see all records in their scope
  if (ctx.userRole === "admin" || ctx.userRole === "manager") {
    return { orgIds };
  }

  // Members see only their own records
  return { orgIds, assignedTo: ctx.userId };
}

export function filterRecords<T extends { orgId: string; assignedTo?: string }>(
  records: T[],
  filter: ScopeFilter
): T[] {
  return records.filter((record) => {
    if (!filter.orgIds.includes(record.orgId)) return false;
    if (filter.assignedTo && record.assignedTo !== filter.assignedTo)
      return false;
    return true;
  });
}
