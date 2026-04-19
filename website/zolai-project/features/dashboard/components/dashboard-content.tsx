"use client";

import Link from "next/link";
import { Users, Shield, Activity, Settings, ArrowRight, Gem } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { isAdmin } from "@/lib/auth/rbac";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardContent() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role || "USER";
  const isAdminUser = isAdmin(role);

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0 p-0">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name || "User"} 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your account
          </p>
        </div>
        <Badge variant={isAdminUser ? "default" : "secondary"} className={isAdminUser ? "bg-primary" : ""}>
          {role}
        </Badge>
      </div>

      {/* Account Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.emailVerified ? "Verified" : "Unverified"}
            </div>
            <p className="text-xs text-muted-foreground">
              {user?.emailVerified ? "Your email is confirmed" : "Please verify your email"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{role}</div>
            <p className="text-xs text-muted-foreground">
              {isAdminUser ? "Full admin access" : "Standard user access"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Your account is active</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="pt-6">
              <Link href="/settings" className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Profile Settings</p>
                  <p className="text-sm text-muted-foreground">Update your name, email, and password</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="pt-6">
              <Link href="/settings/change-password" className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Security</p>
                  <p className="text-sm text-muted-foreground">Change your password and manage sessions</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
          {isAdminUser && (
            <>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="pt-6">
                  <Link href="/admin" className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Shield className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Admin Panel</p>
                      <p className="text-sm text-muted-foreground">Manage content, users, and settings</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="pt-6">
                  <Link href="/admin/analytics" className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <Activity className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Analytics</p>
                      <p className="text-sm text-muted-foreground">View system analytics</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Getting Started */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5" />
            Getting Started
          </CardTitle>
          <CardDescription>Tips to help you get the most out of your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium mt-0.5">
              1
            </span>
            <div>
              <p className="font-medium">Complete your profile</p>
              <p className="text-sm text-muted-foreground">
                Add your name and verify your email to get started
              </p>
            </div>
          </div>
          {isAdminUser && (
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium mt-0.5">
                2
              </span>
              <div>
                <p className="font-medium">Explore admin features</p>
                <p className="text-sm text-muted-foreground">
                  Check out the admin panel for content management and user administration
                </p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium mt-0.5">
              {isAdminUser ? "3" : "2"}
            </span>
            <div>
              <p className="font-medium">Customize settings</p>
              <p className="text-sm text-muted-foreground">
                Set your preferred language and notification preferences
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
