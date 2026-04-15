"use client";

import * as React from "react";
import { SITE_CONSTANTS } from "@/lib/constants/site";
import {
  LayoutDashboard, Settings2, BarChart3, Users, FileText, Image,
  ArrowLeftRight, Settings, MessageCircle, Building2, Bell, Menu,
  AlertCircle, UserCog, BookOpen, BookMarked, Cpu, GraduationCap, Library, Search, Brain,
  Languages, MessagesSquare, Upload, Volume2, Shield,
} from "lucide-react";
import { NavMain } from "@/features/nav/components/nav-main";
import { NavUser } from "@/features/nav/components/nav-user";
import { useAdminStatus } from "@/features/nav/components/admin-switch";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth-client";
import { usePathname } from "next/navigation";

const learnItems = [
  { title: "Lessons", url: "/learn", icon: GraduationCap, items: [{ title: "Lesson Plans", url: "/learn" }] },
  { title: "Dictionary", url: "/dictionary", icon: Search, items: [{ title: "Vocab Search", url: "/dictionary" }] },
  { title: "Grammar", url: "/grammar", icon: BookMarked, items: [{ title: "Grammar Reference", url: "/grammar" }] },
  { title: "Wiki", url: "/wiki", icon: Library, items: [{ title: "Browse Wiki", url: "/wiki" }] },
  { title: "Bible", url: "/bible", icon: BookOpen, items: [{ title: "Browse Bible", url: "/bible" }] },
  { title: "Tutor", url: "/tutor", icon: Brain, items: [{ title: "AI Tutor Chat", url: "/tutor" }] },
  { title: "Audio", url: "/audio", icon: Volume2, items: [{ title: "Pronunciation", url: "/audio" }] },
];

const aiToolItems = [
  { title: "Chat", url: "/chat", icon: MessageCircle, items: [{ title: "AI Chat", url: "/chat" }] },
  { title: "Translate", url: "/translate", icon: Languages, items: [{ title: "Translation Tool", url: "/translate" }] },
  { title: "Training", url: "/training", icon: Cpu, items: [{ title: "Training Runs", url: "/training" }] },
];

const communityItems = [
  { title: "Forum", url: "/forum", icon: MessagesSquare, items: [{ title: "Discussions", url: "/forum" }] },
  { title: "Submit Content", url: "/submit", icon: Upload, items: [{ title: "My Submissions", url: "/submit" }] },
];

const accountItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, items: [{ title: "Dashboard", url: "/dashboard" }] },
  {
    title: "Settings", url: "/settings", icon: Settings2,
    items: [
      { title: "General", url: "/settings" },
      { title: "Security", url: "/settings/change-password" },
      { title: "Device Sessions", url: "/settings/device-sessions" },
    ],
  },
];

const adminNavItems = [
  {
    title: "Admin Panel", url: "/admin", icon: BarChart3,
    items: [
      { title: "Overview",          url: "/admin" },
      { title: "Users",             url: "/admin/users",        icon: Users },
      { title: "Roles",             url: "/admin/roles",        icon: UserCog },
      { title: "Organizations",     url: "/admin/organizations",icon: Building2 },
      { title: "Submissions",       url: "/admin/submissions",  icon: Upload },
      { title: "Posts & Pages",     url: "/admin/posts",        icon: FileText },
      { title: "Bible Corpus",      url: "/admin/bible",        icon: BookOpen },
      { title: "Lessons",           url: "/admin/lessons",      icon: GraduationCap },
      { title: "Resources",         url: "/admin/resources",    icon: Library },
      { title: "Wiki Entries",      url: "/admin/wiki",         icon: Library },
      { title: "Vocabulary",        url: "/admin/vocab",        icon: Search },
      { title: "Dataset & Training",url: "/admin/dataset",      icon: Cpu },
      { title: "Media Library",     url: "/admin/media",        icon: Image },
      { title: "Forms",             url: "/admin/forms",        icon: FileText },
      { title: "Menus",             url: "/admin/menus",        icon: Menu },
      { title: "Redirects",         url: "/admin/redirects",    icon: ArrowLeftRight },
      { title: "Notifications",     url: "/admin/notifications",icon: Bell },
      { title: "Newsletter",        url: "/admin/newsletter/campaigns", icon: Bell },
      { title: "Comments",          url: "/admin/comments",     icon: MessageCircle },
      { title: "Analytics",         url: "/admin/analytics",    icon: BarChart3 },
      { title: "Settings",          url: "/admin/settings",     icon: Settings },
      { title: "Security Monitor",  url: "/admin/security",     icon: AlertCircle },
      { title: "System",            url: "/admin/system",       icon: Cpu },
      { title: "System Control",    url: "/admin/system",       icon: Shield },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = useSession();
  const isAdmin = useAdminStatus();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => { setIsMounted(true); }, []);

  const showAdminNavigation = isMounted && isAdmin;

  const user = isMounted && !isPending && session?.user
    ? { name: session.user.name || "User", email: session.user.email || "user@example.com", avatar: session.user.image || "" }
    : { name: "User", email: "user@example.com", avatar: "" };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-1 py-1">
              <div className="bg-red-700 text-white flex aspect-square size-8 items-center justify-center rounded-lg shrink-0">
                <Brain className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{SITE_CONSTANTS.name}</span>
                <span className="truncate text-xs text-muted-foreground">Second Brain</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>LEARN</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={learnItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>AI TOOLS</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={aiToolItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>COMMUNITY</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={communityItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>ACCOUNT</SidebarGroupLabel>
          <SidebarGroupContent>
            <NavMain items={accountItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>

        {showAdminNavigation && (
          <SidebarGroup>
            <SidebarGroupLabel>ADMIN PANEL</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavMain items={adminNavItems} pathname={pathname} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter><NavUser user={user} /></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
