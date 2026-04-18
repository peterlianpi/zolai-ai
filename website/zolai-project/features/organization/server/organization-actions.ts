import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isSuperAdmin, isAdminRole } from "@/lib/auth/roles";
import type { 
  CreateOrganizationData, 
  InviteMemberData, 
  UpdateMemberData,
  OrganizationWithStats,
  MemberWithUser,
  InvitationWithOrg
} from "../types";
import { headers } from "next/headers";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Create a new organization (Super Admins only)
export async function createOrganizationAction(data: CreateOrganizationData): Promise<ActionResult<OrganizationWithStats>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id || !isSuperAdmin(session.user.role)) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: data.slug }
    });
    
    if (existingOrg) {
      return { success: false, error: "Organization slug already exists" };
    }

     const organization = await prisma.organization.create({
       data: {
         name: data.name,
         slug: data.slug,
         logo: data.logo ?? null,
         // Automatically add creator as owner
         members: {
           create: {
             userId: session.user.id,
             role: "owner"
           }
         }
       },
       select: {
         _count: {
           select: {
             members: true,
             invitations: true
           }
         }
       }
     });

    revalidatePath("/admin/organizations");
    return { success: true, data: organization as OrganizationWithStats };
  } catch (_error) {
    return { success: false, error: "Failed to create organization" };
  }
}

// Get all organizations with stats (Admin only)
export async function getOrganizationsAction(): Promise<ActionResult<OrganizationWithStats[]>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id || !session.user.role || !isAdminRole(session.user.role)) {
      return { success: false, error: "Unauthorized" };
    }

     const organizations = await prisma.organization.findMany({
       select: {
         _count: {
           select: {
             members: true,
             invitations: true
           }
         }
       },
       orderBy: {
         createdAt: "desc"
       }
     });

    return { success: true, data: organizations as OrganizationWithStats[] };
  } catch (_error) {
    return { success: false, error: "Failed to fetch organizations" };
  }
}

// Get current user's organizations
export async function getUserOrganizationsAction(): Promise<ActionResult<OrganizationWithStats[]>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

     const memberships = await prisma.member.findMany({
       where: { userId: session.user.id },
       select: {
         id: true,
         role: true,
         organization: {
           select: {
             id: true,
             name: true,
             slug: true,
             logo: true,
           }
         }
       }
     });

    const organizations = memberships.map(membership => membership.organization) as OrganizationWithStats[];
    return { success: true, data: organizations };
  } catch (_error) {
    return { success: false, error: "Failed to fetch user organizations" };
  }
}

// Get organization members
export async function getOrganizationMembersAction(organizationId: string): Promise<ActionResult<MemberWithUser[]>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user has access to this organization
    const membership = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id
      }
    });

    if (!membership && (!session.user.role || !isAdminRole(session.user.role))) {
      return { success: false, error: "Unauthorized" };
    }

     const members = await prisma.member.findMany({
       where: {
         organizationId
       },
       select: {
         id: true,
         role: true,
         organizationId: true,
         user: {
           select: {
             id: true,
             name: true,
             email: true,
             image: true
           }
         }
       },
       orderBy: {
         createdAt: "desc"
       }
     });

    return { success: true, data: members as MemberWithUser[] };
  } catch (_error) {
    return { success: false, error: "Failed to fetch organization members" };
  }
}

// Invite member to organization
export async function inviteMemberAction(data: InviteMemberData): Promise<ActionResult<InvitationWithOrg>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user has permission to invite members
    const membership = await prisma.member.findFirst({
      where: {
        organizationId: data.organizationId,
        userId: session.user.id,
        role: {
          in: ["owner", "admin"]
        }
      }
    });

    if (!membership && (!session.user.role || !isAdminRole(session.user.role))) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      const existingMember = await prisma.member.findFirst({
        where: {
          organizationId: data.organizationId,
          userId: existingUser.id
        }
      });
      
      if (existingMember) {
        return { success: false, error: "User is already a member of this organization" };
      }
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        organizationId: data.organizationId,
        email: data.email,
        status: "pending"
      }
    });

    if (existingInvitation) {
      return { success: false, error: "Invitation already pending for this email" };
    }

    const invitation = await prisma.invitation.create({
      data: {
        organizationId: data.organizationId,
        email: data.email,
        role: data.role,
        inviterId: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "pending"
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        organization: { select: { id: true, name: true, slug: true, logo: true } },
        inviter: { select: { id: true, name: true, email: true } },
      }
    });

    revalidatePath(`/admin/organizations/${data.organizationId}`);
    return { success: true, data: invitation as InvitationWithOrg };
  } catch (_error) {
    return { success: false, error: "Failed to invite member" };
  }
}

// Update member role
export async function updateMemberRoleAction(data: UpdateMemberData): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const member = await prisma.member.findUnique({
      where: { id: data.memberId },
      select: { id: true, role: true, organizationId: true, organization: { select: { id: true, name: true, slug: true } } }
    });

    if (!member) {
      return { success: false, error: "Member not found" };
    }

    // Check if user has permission to update roles
    const userMembership = await prisma.member.findFirst({
      where: {
        organizationId: member.organizationId,
        userId: session.user.id,
        role: {
          in: ["owner", "admin"]
        }
      }
    });

    if (!userMembership && (!session.user.role || !isAdminRole(session.user.role))) {
      return { success: false, error: "Unauthorized" };
    }

    // Can't change owner role unless you're a super admin
    if (member.role === "owner" && !isSuperAdmin(session.user.role)) {
      return { success: false, error: "Cannot change owner role" };
    }

    await prisma.member.update({
      where: { id: data.memberId },
      data: { role: data.role }
    });

    revalidatePath(`/admin/organizations/${member.organizationId}`);
    return { success: true };
  } catch (_error) {
    return { success: false, error: "Failed to update member role" };
  }
}

// Remove member from organization
export async function removeMemberAction(memberId: string): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, role: true, organizationId: true, organization: { select: { id: true, name: true, slug: true } } }
    });

    if (!member) {
      return { success: false, error: "Member not found" };
    }

    // Check if user has permission to remove members
    const userMembership = await prisma.member.findFirst({
      where: {
        organizationId: member.organizationId,
        userId: session.user.id,
        role: {
          in: ["owner", "admin"]
        }
      }
    });

    if (!userMembership && (!session.user.role || !isAdminRole(session.user.role))) {
      return { success: false, error: "Unauthorized" };
    }

    // Can't remove owner unless you're a super admin
    if (member.role === "owner" && !isSuperAdmin(session.user.role)) {
      return { success: false, error: "Cannot remove owner" };
    }

    await prisma.member.delete({
      where: { id: memberId }
    });

    revalidatePath(`/admin/organizations/${member.organizationId}`);
    return { success: true };
  } catch (_error) {
    return { success: false, error: "Failed to remove member" };
  }
}

// Switch active organization
export async function switchOrganizationAction(organizationId: string): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify user is a member of the organization
    const membership = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id
      }
    });

    if (!membership) {
      return { success: false, error: "Not a member of this organization" };
    }

    // Update session with active organization
    await prisma.session.updateMany({
      where: { userId: session.user.id },
      data: { activeOrganizationId: organizationId }
    });

    revalidatePath("/");
    return { success: true };
  } catch (_error) {
    return { success: false, error: "Failed to switch organization" };
  }
}