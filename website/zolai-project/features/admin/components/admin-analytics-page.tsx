"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { FileText, Image, TrendingUp, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { client } from "@/lib/api/client";
import type { AdminAnalyticsData } from "@/features/admin/components/admin-analytics-charts";

const AdminAnalyticsCharts = dynamic(() => import("@/features/admin/components/admin-analytics-charts"), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />,
});

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState(30);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", period],
    queryFn: async () => {
      const res = await client.api.admin.analytics.$get({ query: { period: period.toString() } });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json() as unknown as { success: boolean; data: AdminAnalyticsData & { topPosts: { id: string; title: string; slug: string; publishedAt: string | null }[]; topPages: { id: string; title: string; slug: string; createdAt: string }[] } };
    },
  });

  const analyticsData = data?.data;

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-0">
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">Failed to load analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">View system performance and usage statistics</p>
        </div>
        <Tabs value={period.toString()} onValueChange={(value) => setPeriod(Number.parseInt(value, 10))}>
          <TabsList>
            <TabsTrigger value="7">7 days</TabsTrigger>
            <TabsTrigger value="30">30 days</TabsTrigger>
            <TabsTrigger value="90">90 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-48" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{analyticsData?.timeline.reduce((sum, item) => sum + item.users, 0) || 0}</div><p className="text-xs text-muted-foreground">New users in period</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Posts</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{analyticsData?.timeline.reduce((sum, item) => sum + item.posts, 0) || 0}</div><p className="text-xs text-muted-foreground">Posts created</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">News Articles</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{analyticsData?.timeline.reduce((sum, item) => sum + item.news, 0) || 0}</div><p className="text-xs text-muted-foreground">News published</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Media Files</CardTitle><Image className="h-4 w-4 text-muted-foreground" aria-label="Media" /></CardHeader><CardContent><div className="text-2xl font-bold">{analyticsData?.mediaByType.reduce((sum, item) => sum + item.count, 0) || 0}</div><p className="text-xs text-muted-foreground">Uploaded files</p></CardContent></Card>
          </div>

          <AdminAnalyticsCharts analyticsData={analyticsData} />

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Top Posts</CardTitle><CardDescription>Most recently published posts</CardDescription></CardHeader>
              <CardContent><div className="space-y-4">{(analyticsData?.topPosts || []).slice(0, 5).map((post) => <div key={post.id} className="flex items-center justify-between"><div className="min-w-0 flex-1"><p className="truncate font-medium">{post.title}</p><p className="text-sm text-muted-foreground">/{post.slug}</p></div><span className="text-sm text-muted-foreground">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "-"}</span></div>)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Top Pages</CardTitle><CardDescription>Most recently created pages</CardDescription></CardHeader>
              <CardContent><div className="space-y-4">{(analyticsData?.topPages || []).slice(0, 5).map((page) => <div key={page.id} className="flex items-center justify-between"><div className="min-w-0 flex-1"><p className="truncate font-medium">{page.title}</p><p className="text-sm text-muted-foreground">/{page.slug}</p></div><span className="text-sm text-muted-foreground">{new Date(page.createdAt).toLocaleDateString()}</span></div>)}</div></CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
