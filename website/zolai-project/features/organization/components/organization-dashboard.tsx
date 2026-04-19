"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Users, Mail, Settings } from "lucide-react";
import Image from "next/image";
import { useOrganizations } from "../hooks/use-organizations";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import type { OrganizationWithStats } from "../types";

export function OrganizationDashboard() {
  const { data: organizations, isLoading: isLoadingOrgs } = useOrganizations();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage contributor organizations and team members
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Organization
        </Button>
      </div>

      {/* Organizations Grid */}
      {isLoadingOrgs ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations?.map((org: OrganizationWithStats) => (
            <Card key={org.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {org.logo ? (
                    <Image 
                      src={org.logo} 
                      alt={org.name} 
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded object-cover" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{org.name}</CardTitle>
                    <CardDescription className="text-sm">/{org.slug}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{org._count.members} members</span>
                  </div>
                  {org._count.invitations > 0 && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{org._count.invitations} pending</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Contributor
                  </Badge>
                  <Badge 
                    variant={org._count.members > 0 ? "default" : "outline"} 
                    className="text-xs"
                  >
                    {org._count.members > 0 ? "Active" : "Setup"}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`/admin/organizations/${org.id}`}>
                      <Users className="h-3 w-3 mr-1" />
                      Members
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/admin/organizations/${org.id}/settings`}>
                      <Settings className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {organizations && organizations.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Organizations</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first contributor organization.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Organization Dialog */}
      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}