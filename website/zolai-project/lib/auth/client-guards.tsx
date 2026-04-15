"use client";

/**
 * Client-side permission hooks and components
 */

import { useSession } from "@/lib/auth-client";
import { hasPermission, isAdmin, Permission } from "./rbac";
import { ReactNode } from "react";

// Permission hooks
export function useHasPermission(permission: Permission): boolean {
  const { data: session } = useSession();
  return session?.user ? hasPermission(session.user.role, permission) : false;
}

export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  return session?.user ? isAdmin(session.user.role) : false;
}

export function useUserRole(): string | null {
  const { data: session } = useSession();
  return session?.user?.role || null;
}

// Permission guard component
interface PermissionGuardProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const hasAccess = useHasPermission(permission);
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Admin guard component
interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminGuard({ children, fallback = null }: AdminGuardProps) {
  const isAdminUser = useIsAdmin();
  return isAdminUser ? <>{children}</> : <>{fallback}</>;
}
