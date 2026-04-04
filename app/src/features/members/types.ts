export interface OrgMember {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
}

export interface OrgGroup {
  id: string;
  name: string;
  path: string;
  subGroups?: OrgGroup[];
}
