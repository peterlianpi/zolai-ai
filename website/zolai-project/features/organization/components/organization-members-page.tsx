"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, UserPlus, MoreHorizontal, Mail, Shield, User, Crown } from "lucide-react";
import Link from "next/link";
import {
  useOrganizationMembers, 
  useUpdateMemberRole, 
  useRemoveMember 
} from "../hooks/use-organizations";
import { InviteMemberDialog } from "./invite-member-dialog";
import type { MemberWithUser, OrganizationRole } from "../types";

interface OrganizationMembersPageProps {
  organizationId: string;
}

export function OrganizationMembersPage({ organizationId }: OrganizationMembersPageProps) {
  const { data: members, isLoading } = useOrganizationMembers(organizationId);
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge variant="default">Owner</Badge>;
      case "admin":
        return <Badge variant="secondary">Admin</Badge>;
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  };

  const handleUpdateRole = (memberId: string, newRole: Extract<OrganizationRole, "owner" | "admin" | "member">) => {
    updateRoleMutation.mutate({ memberId, role: newRole });
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      removeMemberMutation.mutate(memberId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/organizations">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organization Members</h1>
          <p className="text-muted-foreground">
            Manage members and their roles in this organization
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({members?.length || 0})</CardTitle>
          <CardDescription>
            Organization members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : members && members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member: MemberWithUser) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user.image || undefined} />
                          <AvatarFallback>
                            {member.user.name?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {member.user.name || "Anonymous User"}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {member.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        {getRoleBadge(member.role)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            disabled={member.role === "owner"}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {member.role !== "admin" && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member.id, "admin")}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          {member.role !== "member" && member.role !== "owner" && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member.id, "member")}
                            >
                              <User className="h-4 w-4 mr-2" />
                              Make Member
                            </DropdownMenuItem>
                          )}
                          {member.role !== "owner" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                Remove from organization
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Members</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This organization has no members yet. Invite someone to get started.
              </p>
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite First Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        organizationId={organizationId}
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </div>
  );
}
