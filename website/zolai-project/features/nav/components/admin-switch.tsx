"use client";

import { Shield, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";

interface AdminSwitchProps {
  isAdmin?: boolean;
  isLoading?: boolean;
}

export function AdminSwitch({ isAdmin, isLoading }: AdminSwitchProps) {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";
  const isAdminPage = pathname.startsWith("/admin");

  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/admin"
              className={cn(
                "flex items-center justify-center rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted",
                isCollapsed ? "h-8 w-8 p-0" : "h-10 px-3 py-2 gap-2",
                isAdminPage && "bg-primary/10 text-primary hover:bg-primary/15",
              )}
            >
              {isAdminPage ? (
                <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              ) : (
                <Shield className="h-4.5 w-4.5 shrink-0" />
              )}
              {!isCollapsed && (
                <span className="text-sm font-medium truncate">Admin</span>
              )}
            </Link>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              <p>Go to Admin Dashboard</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

import { useIsAdmin } from "@/lib/auth/client-guards";

export function useAdminStatus(): boolean | null {
  const { isPending } = useSession();
  const isAdminUser = useIsAdmin();
  return useMemo(() => {
    if (isPending) return null;
    return isAdminUser;
  }, [isAdminUser, isPending]);
}

export function useHasPermission(): boolean | null {
  const { isPending } = useSession();
  const isAdminUser = useIsAdmin();
  return useMemo(() => {
    if (isPending) return null;
    return isAdminUser;
  }, [isAdminUser, isPending]);
}
