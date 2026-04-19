import type { OrganizationModel } from "@/lib/generated/prisma/models/Organization";
import type { MemberModel } from "@/lib/generated/prisma/models/Member";
import type { InvitationModel } from "@/lib/generated/prisma/models/Invitation";

// Organization with member count
export interface OrganizationWithStats extends OrganizationModel {
  _count: {
    members: number;
    invitations: number;
  };
}

// Member with user details
export interface MemberWithUser extends MemberModel {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

// Invitation with organization details
export interface InvitationWithOrg extends InvitationModel {
  organization: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  inviter: {
    id: string;
    name: string;
    email: string;
  };
}

// Form types for creating/editing organizations
export interface CreateOrganizationData {
  name: string;
  slug: string;
  logo?: string;
  metadata?: Record<string, unknown>;
}

export interface InviteMemberData {
  email: string;
  role: "admin" | "member";
  organizationId: string;
}

export interface UpdateMemberData {
  memberId: string;
  role: string;
}

// Organization role types
export type OrganizationRole = "owner" | "admin" | "member" | "viewer";

export const ORGANIZATION_ROLES: { value: OrganizationRole; label: string; description: string }[] = [
  {
    value: "owner",
    label: "Owner",
    description: "Full control over the organization, including deletion and billing"
  },
  {
    value: "admin", 
    label: "Admin",
    description: "Can manage members, content, and organization settings"
  },
  {
    value: "member",
    label: "Member", 
    description: "Can create and edit content within the organization"
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access to organization content"
  }
];

// Organization-specific metadata
export interface ISPOrganizationMetadata {
  orgType: "community" | "academic" | "religious" | "ngo";
  serviceAreas: string[];
  website?: string;
  phone?: string;
  supportEmail?: string;
  coverageMap?: string;
  speedTiers?: {
    name: string;
    downloadSpeed: string;
    uploadSpeed: string;
    price: string;
  }[];
}

// API response types
export interface OrganizationListResponse {
  organizations: OrganizationWithStats[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MemberListResponse {
  members: MemberWithUser[];
  total: number;
  page: number;
  pageSize: number;
}
