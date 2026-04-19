import * as React from "react";
import { Brain } from "lucide-react";
import { SITE_CONSTANTS } from "@/lib/constants/site";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export function TeamSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-1 py-1">
          <div className="bg-red-700 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
            <Brain className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{SITE_CONSTANTS.name}</span>
            <span className="truncate text-xs text-muted-foreground">Second Brain</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
