/**
 * Consolidated useAuth Hook
 * 
 * Provides a unified interface for authentication state and actions.
 * Wraps Better Auth's useSession and adds helper properties/methods.
 */

import { useSession, authClient } from "@/lib/auth-client";
import { useMemo } from "react";
import { isAdminRole, isSuperAdmin as isSuperAdminRole } from "@/lib/auth/roles";

export function useAuth() {
  const { data: session, isPending, error, refetch } = useSession();

  const user = session?.user ?? null;
  const isAuthenticated = !!session;
  
  // Role checks
  const isAdmin = useMemo(() => 
    user ? isAdminRole(user.role) : false, 
  [user]);
  
  const isSuperAdmin = useMemo(() => 
    user ? isSuperAdminRole(user.role) : false, 
  [user]);

  // Auth actions
  const signOut = async () => {
    await authClient.signOut();
    await refetch();
  };

  return {
    user,
    session: session?.session ?? null,
    isAuthenticated,
    isLoading: isPending,
    error,
    isAdmin,
    isSuperAdmin,
    signOut,
    refresh: refetch,
    // Role convenience
    role: user?.role ?? "user",
  };
}
