"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  pathname,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  pathname: string
}) {
  const [localOpenItems, setLocalOpenItems] = useState<Set<string>>(() => {
    const isPathActive = (targetUrl: string) => {
      const normalized = targetUrl.endsWith("/") ? targetUrl.slice(0, -1) : targetUrl
      const path = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
      if (path === normalized) return true
      if (path.startsWith(normalized + "/")) {
        if (normalized === "/admin") return false
        if (normalized === "/dashboard") return false
        if (normalized === "/settings") return false
        return true
      }
      return false
    }

    const activeItems = new Set<string>()
    items.forEach((item) => {
      if (isPathActive(item.url)) {
        activeItems.add(item.title)
      }
      item.items?.forEach((subItem) => {
        if (isPathActive(subItem.url)) {
          activeItems.add(item.title)
        }
      })
    })
    return activeItems
  })

  const isPathActive = useCallback((targetUrl: string) => {
    const normalized = targetUrl.endsWith("/") ? targetUrl.slice(0, -1) : targetUrl
    const path = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
    if (path === normalized) return true
    if (path.startsWith(normalized + "/")) {
      if (normalized === "/admin") return false
      if (normalized === "/dashboard") return false
      if (normalized === "/settings") return false
      return true
    }
    return false
  }, [pathname])

  const handleToggle = useCallback((title: string, open: boolean) => {
    setLocalOpenItems((prev) => {
      const next = new Set(prev)
      if (open) {
        next.add(title)
      } else {
        next.delete(title)
      }
      return next
    })
  }, [])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const itemActive = isPathActive(item.url)
          return (
            <Collapsible
              key={item.title}
              asChild
              open={localOpenItems.has(item.title)}
              onOpenChange={(open) => handleToggle(item.title, open)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={itemActive}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const subActive = subItem.url === item.url ? false : isPathActive(subItem.url);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={subActive}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}