export interface OrgInvitation {
  id: string;
  email: string;
  status: "PENDING" | "EXPIRED";
  organizationId: string;
  sentDate: number;
  expiresAt: number;
  inviteLink?: string;
}
