import "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    organization?: Record<
      string,
      {
        id: string;
        groups?: string[];
      }
    > | null;
    activeOrg?: string;
    orgRole?: "admin" | "manager" | "member";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpiresAt?: number;
    error?: string;
  }
}

export interface Organization {
  id: string;
  name: string;
  alias: string;
  domains?: Array<{ name: string; verified: boolean }>;
  attributes?: Record<string, string[]>;
}

export interface OrgMember {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
}

export interface OrgInvitation {
  id: string;
  email: string;
  status: "PENDING" | "EXPIRED";
  createdTimestamp: number;
  expirationTimestamp?: number;
}

export interface OrgGroup {
  id: string;
  name: string;
  path: string;
  subGroups?: OrgGroup[];
}

export type OrgRole = "admin" | "manager" | "member";

export interface OnboardingState {
  hasOrg: boolean;
  needsOnboarding: boolean;
  existingOrgForDomain?: Organization | null;
}
