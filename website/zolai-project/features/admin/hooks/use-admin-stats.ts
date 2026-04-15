import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  recentActivity: () => [...adminKeys.all, "recent-activity"] as const,
  dashboardLayout: () => [...adminKeys.all, "dashboard-layout"] as const,
  quickActionsLayout: () => [...adminKeys.all, "quick-actions-layout"] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: async () => {
      const res = await client.api.admin.stats.$get();
      if (!res.ok) {
        const error = await res.json() as { error?: { message?: string } };
        if ("error" in error) {
          throw new Error(
            error.error?.message || "Failed to fetch admin stats",
          );
        }
        throw new Error("Failed to fetch admin stats");
      }
      const data = await res.json();
      return data as { success: boolean; data: { 
        totalUsers: number
        activeUsers: number
        totalPosts: number
        totalNews: number
        totalPages: number
        totalMedia: number
        totalRedirects: number
      } };
    },
  });
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: [...adminKeys.recentActivity(), limit],
    queryFn: async () => {
      const res = await client.api.admin["recent-activity"].$get({
        query: { limit: limit.toString() },
      });
      if (!res.ok) {
        const error = await res.json() as { error?: { message?: string } };
        if ("error" in error) {
          throw new Error(
            error.error?.message || "Failed to fetch recent activity",
          );
        }
        throw new Error("Failed to fetch recent activity");
      }
      const data = await res.json();
      return data as { success: boolean; data: Array<{
        id: string;
        action: string;
        entityType: string;
        entityId: string;
        createdAt: string;
        createdBy?: { name: string; email: string } | null;
      }> };
    },
  });
}

export type DashboardCard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  dataKey: string;
};

export const AVAILABLE_CARDS: DashboardCard[] = [
  { id: "totalUsers",       title: "Total Users",    description: "Active users in system",    icon: "Users",         dataKey: "totalUsers" },
  { id: "activeUsers",      title: "Active Users",   description: "Active in last 30 days",    icon: "Users",         dataKey: "activeUsers" },
  { id: "totalPosts",       title: "Posts",          description: "Published posts",           icon: "FileText",      dataKey: "totalPosts" },
  { id: "totalNews",        title: "News",           description: "Published news articles",   icon: "Newspaper",     dataKey: "totalNews" },
  { id: "totalPages",       title: "Pages",          description: "Total pages",               icon: "File",          dataKey: "totalPages" },
  { id: "totalMedia",       title: "Media",          description: "Uploaded files",            icon: "Image",         dataKey: "totalMedia" },
  { id: "totalRedirects",   title: "Redirects",      description: "Active redirects",          icon: "ArrowLeftRight",dataKey: "totalRedirects" },
  { id: "totalBibleVerses", title: "Bible Verses",   description: "Parallel corpus verses",    icon: "Menu",          dataKey: "totalBibleVerses" },
  { id: "totalVocabWords",  title: "Vocab Words",    description: "Dictionary entries",        icon: "FileText",      dataKey: "totalVocabWords" },
  { id: "totalWikiEntries", title: "Wiki Entries",   description: "Knowledge base articles",   icon: "File",          dataKey: "totalWikiEntries" },
  { id: "totalLessonPlans", title: "Lesson Plans",   description: "Active CEFR lesson plans",  icon: "Activity",      dataKey: "totalLessonPlans" },
  { id: "systemStatus",     title: "System Status",  description: "All systems operational",   icon: "Activity",      dataKey: "systemStatus" },
];

const DEFAULT_LAYOUT = [
  "totalUsers", "activeUsers",
  "totalBibleVerses", "totalVocabWords",
  "totalWikiEntries", "totalLessonPlans",
  "totalPosts", "totalMedia",
];

export function useDashboardLayout() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.dashboardLayout(),
    queryFn: async () => {
      const res = await client.api.admin["dashboard-layout"].$get();
      if (!res.ok) {
        const error = await res.json() as { error?: { message?: string } };
        if ("error" in error) {
          throw new Error(
            error.error?.message || "Failed to fetch dashboard layout",
          );
        }
        throw new Error("Failed to fetch dashboard layout");
      }
      const data = await res.json();
      return data as { success: boolean; data: string[] | null };
    },
  });

  const mutation = useMutation({
    mutationFn: async (layout: string[]) => {
      const res = await client.api.admin["dashboard-layout"].$put({
        json: { layout },
      });
      if (!res.ok) {
        const error = await res.json() as { error?: { message?: string } };
        throw new Error(error.error?.message || "Failed to save dashboard layout");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboardLayout() });
    },
  });

  const layout = data?.data || DEFAULT_LAYOUT;

  return {
    layout,
    isLoading,
    isSaving: mutation.isPending,
    saveLayout: mutation.mutate,
    availableCards: AVAILABLE_CARDS,
  };
}

export type QuickAction = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
};

export const AVAILABLE_ACTIONS: QuickAction[] = [
  { id: "users",     title: "Manage Users",     description: "View and manage users",          href: "/admin/users",     icon: "Users" },
  { id: "posts",     title: "Posts & Pages",    description: "Create and edit posts/pages",    href: "/admin/posts",     icon: "FileText" },
  { id: "bible",     title: "Bible Corpus",     description: "Browse and search Bible verses", href: "/admin/bible",     icon: "Menu" },
  { id: "vocab",     title: "Vocabulary",       description: "Manage dictionary entries",      href: "/admin/vocab",     icon: "FileText" },
  { id: "wiki",      title: "Wiki Entries",     description: "Edit knowledge base articles",   href: "/admin/wiki",      icon: "File" },
  { id: "lessons",   title: "Lesson Plans",     description: "Manage CEFR lesson plans",       href: "/admin/lessons",   icon: "Activity" },
  { id: "media",     title: "Manage Media",     description: "Upload and organize media",      href: "/admin/media",     icon: "Image" },
  { id: "dataset",   title: "Dataset & Training",description: "Training runs and stats",       href: "/admin/dataset",   icon: "LineChart" },
  { id: "menus",     title: "Manage Menus",     description: "Edit navigation menus",          href: "/admin/menus",     icon: "Menu" },
  { id: "analytics", title: "View Analytics",   description: "Performance insights",           href: "/admin/analytics", icon: "LineChart" },
];

const DEFAULT_ACTIONS = [
  "users", "posts", "bible", "vocab", "wiki", "lessons", "media", "dataset",
];

export function useQuickActionsLayout() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.quickActionsLayout(),
    queryFn: async () => {
      const res = await client.api.admin["quick-actions-layout"].$get();
      if (!res.ok) {
        const error = await res.json() as { error?: { message?: string } };
        if ("error" in error) {
          throw new Error(
            error.error?.message || "Failed to fetch quick actions layout",
          );
        }
        throw new Error("Failed to fetch quick actions layout");
      }
      const data = await res.json();
      return data as { success: boolean; data: string[] | null };
    },
  });

  const mutation = useMutation({
    mutationFn: async (layout: string[]) => {
      const res = await client.api.admin["quick-actions-layout"].$put({
        json: { layout },
      });
      if (!res.ok) {
        const error = await res.json() as { error?: { message?: string } };
        throw new Error(error.error?.message || "Failed to save quick actions layout");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.quickActionsLayout() });
    },
  });

  const layout = data?.data || DEFAULT_ACTIONS;

  return {
    layout,
    isLoading,
    isSaving: mutation.isPending,
    saveLayout: mutation.mutate,
    availableActions: AVAILABLE_ACTIONS,
  };
}
