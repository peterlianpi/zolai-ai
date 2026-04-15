"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/nav/components/app-sidebar";
import { ModeToggle } from "@/features/nav/components/theme-toggle";
import { NotificationBell } from "@/features/notifications/components/notification-bell";

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  structure: "Architecture Guide",
  settings: "Settings",
  admin: "Admin",
  users: "Users",
  roles: "Roles",
  dictionary: "Dictionary",
  grammar: "Grammar Reference",
  wiki: "Linguistics Wiki",
  bible: "Bible Corpus",
  training: "AI Training",
  chat: "Zolai Chat",
  tutor: "Language Tutor",
  audio: "Audio Pronunciation",
  translate: "Translation Tool",
  forum: "Community Forum",
  submit: "Submit Content",
  learn: "Learn",
  notifications: "Notifications",
  security: "Security",
  organizations: "Organizations",
  media: "Media Library",
  menus: "Menus",
  redirects: "Redirects",
  forms: "Forms",
  vocab: "Vocabulary",
  system: "System Control",
  submissions: "Content Submissions",
  lessons: "Lessons",
  posts: "Posts & Pages",
  analytics: "Analytics",
  comments: "Comments",
  resources: "Resources",
};

function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      <ModeToggle />
    </div>
  );
}

function BreadcrumbHandler() {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const isLast = index === pathSegments.length - 1;
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label =
      BREADCRUMB_LABELS[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);

    return { segment, label, href, isLast };
  });

  return (
    <>
      <Breadcrumb className="flex-1 overflow-hidden">
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage className="truncate max-w-50">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={item.href}
                    className="truncate max-w-50"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <HeaderActions />
    </>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-t-2 border-t-red-600 bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <React.Suspense
              fallback={
                <div className="flex-1 overflow-hidden flex justify-end">
                  <div className="h-8 w-48 animate-pulse bg-muted rounded" />
                </div>
              }
            >
              <BreadcrumbHandler />
            </React.Suspense>
          </div>
        </header>
        <div className="flex w-full flex-1 flex-col gap-4 p-4 pt-0 overflow-x-hidden">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
