"use client";

import { useSession } from "@/lib/auth-client";
import { hasPermission, Permission } from "@/lib/auth/rbac";
import { ReactNode } from "react";

interface PermissionGuardProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { data: session } = useSession();
  
  if (!session?.user || !hasPermission(session.user.role, permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export function useHasPermission(permission: Permission): boolean {
  const { data: session } = useSession();
  return session?.user ? hasPermission(session.user.role, permission) : false;
}
