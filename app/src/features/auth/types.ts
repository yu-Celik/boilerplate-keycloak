import "next-auth";
import type { OrgRole } from "@/features/organization/types";

declare module "next-auth" {
  interface Session {
    error?: string;
    organization?: Record<
      string,
      {
        id: string;
        groups?: string[];
      }
    > | null;
    activeOrg?: string;
    orgRole?: OrgRole;
    platformRole?: "platform-admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpiresAt?: number;
    error?: string;
    platformRole?: "platform-admin";
  }
}
