export const ORG_GROUPS = {
  ADMIN: "Admin",
  MANAGERS: "Managers",
  MEMBERS: "Members",
} as const;

export type OrgGroupName = (typeof ORG_GROUPS)[keyof typeof ORG_GROUPS];

export const DEFAULT_GROUPS: readonly OrgGroupName[] = [
  ORG_GROUPS.ADMIN,
  ORG_GROUPS.MANAGERS,
  ORG_GROUPS.MEMBERS,
];
