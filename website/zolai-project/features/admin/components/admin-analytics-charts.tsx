"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export interface AdminAnalyticsData {
  period: number;
  timeline: Array<{ date: string; posts: number; news: number; pages: number; users: number }>;
  postsByStatus: Array<{ status: string; count: number }>;
  postsByType: Array<{ type: string; count: number }>;
  mediaByType: Array<{ type: string | null; count: number }>;
}

interface PieLabelProps {
  name?: string | number;
  percent?: number;
}

export default function AdminAnalyticsCharts({ analyticsData }: { analyticsData: AdminAnalyticsData | null | undefined }) {
  const formatDate = (dateStr: ReactNode) => {
    if (typeof dateStr !== "string") return String(dateStr);
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader><CardTitle>Activity Over Time</CardTitle><CardDescription>Posts, news, and users created</CardDescription></CardHeader>
        <CardContent><div className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={analyticsData?.timeline || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip labelFormatter={formatDate} contentStyle={{ fontSize: 12 }} /><Legend /><Line type="monotone" dataKey="posts" stroke="#0088FE" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="news" stroke="#00C49F" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="users" stroke="#FFBB28" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader><CardTitle>Posts by Status</CardTitle><CardDescription>Distribution of post statuses</CardDescription></CardHeader>
        <CardContent><div className="h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analyticsData?.postsByStatus || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }: PieLabelProps) => `${name || "Unknown"} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>{(analyticsData?.postsByStatus || []).map((_, index) => <Cell key={`status-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer></div></CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader><CardTitle>Posts by Type</CardTitle><CardDescription>Distribution of content types</CardDescription></CardHeader>
        <CardContent><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={analyticsData?.postsByType || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="type" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip contentStyle={{ fontSize: 12 }} /><Bar dataKey="count" fill="#0088FE" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader><CardTitle>Media by Type</CardTitle><CardDescription>Media files grouped by type</CardDescription></CardHeader>
        <CardContent><div className="h-80"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={analyticsData?.mediaByType || []} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }: PieLabelProps) => `${typeof name === "string" ? name.split("/")[1] || name : name || "Unknown"} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>{(analyticsData?.mediaByType || []).map((_, index) => <Cell key={`media-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer></div></CardContent>
      </Card>
    </div>
  );
}
