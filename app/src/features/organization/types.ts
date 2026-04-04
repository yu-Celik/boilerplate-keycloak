export interface Organization {
  id: string;
  name: string;
  alias: string;
  enabled?: boolean;
  domains?: Array<{ name: string; verified: boolean }>;
  attributes?: Record<string, string[]>;
}

export type OrgRole = "admin" | "manager" | "member";
