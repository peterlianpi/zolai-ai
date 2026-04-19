"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle, Users, Activity, Lock, Eye, TrendingUp, Clock, Ban } from "lucide-react";
import { useSecurityStatsByRange, useSecurityEvents, useBlockedIps, useRateLimitConfig, useUpdateRateLimitConfig } from "@/features/security/hooks/use-security";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function AdminSecurityPage() {
  const [timeRange, setTimeRange] = useState("24h");
  const { data: stats, isLoading: statsLoading } = useSecurityStatsByRange(timeRange as "24h" | "7d" | "30d");
  const { data: events, isLoading: eventsLoading } = useSecurityEvents({ page: 1, limit: 10 });
  const { data: blockedIps, isLoading: blockedIpsLoading } = useBlockedIps();
  const { data: rateLimitConfig } = useRateLimitConfig();
  const updateRateLimitConfig = useUpdateRateLimitConfig();
  const statsData = stats && "data" in stats ? stats.data : null;
  const eventsData = events && "data" in events ? events.data : [];
  const blockedIpsData = blockedIps && "data" in blockedIps ? blockedIps.data : [];
  const configData = rateLimitConfig && "data" in rateLimitConfig ? rateLimitConfig.data : null;

  const [globalPerMinuteInput, setGlobalPerMinuteInput] = useState("");
  const [authPer15MinInput, setAuthPer15MinInput] = useState("");
  const [adminPerMinuteInput, setAdminPerMinuteInput] = useState("");

  const selectedWindowCountLabel = useMemo(() => {
    if (timeRange === "7d") return "in the last 7 days";
    if (timeRange === "30d") return "in the last 30 days";
    return "in the last 24 hours";
  }, [timeRange]);

  const handleSaveRateLimits = async () => {
    if (!configData) return;
    const payload = {
      globalPerMinute: Number.parseInt(globalPerMinuteInput || String(configData.globalPerMinute), 10),
      authPer15Min: Number.parseInt(authPer15MinInput || String(configData.authPer15Min), 10),
      adminPerMinute: Number.parseInt(adminPerMinuteInput || String(configData.adminPerMinute), 10),
      autoBlockEnabled: configData.autoBlockEnabled,
      autoBlockThreshold: configData.autoBlockThreshold,
      autoBlockDurationMinutes: configData.autoBlockDurationMinutes,
    };
    if (!Number.isFinite(payload.globalPerMinute) || !Number.isFinite(payload.authPer15Min) || !Number.isFinite(payload.adminPerMinute)) {
      toast.error("Please enter valid numeric limits"); return;
    }
    try { await updateRateLimitConfig.mutateAsync(payload); setGlobalPerMinuteInput(""); setAuthPer15MinInput(""); setAdminPerMinuteInput(""); toast.success("Rate limit settings updated"); }
    catch { toast.error("Failed to update rate limit settings"); }
  };

  if (statsLoading || eventsLoading) return (
    <div className="space-y-6"><div className="flex items-center gap-2"><Shield className="h-6 w-6" /><h1 className="text-2xl font-bold">Security Dashboard</h1></div><div className="animate-pulse grid grid-cols-1 md:grid-cols-4 gap-4"><div className="h-32 bg-gray-200 rounded-lg"></div><div className="h-32 bg-gray-200 rounded-lg"></div><div className="h-32 bg-gray-200 rounded-lg"></div><div className="h-32 bg-gray-200 rounded-lg"></div></div></div>
  );

  const securityStats = statsData || { totalEvents: 0, events24h: 0, events7d: 0, events30d: 0, eventsInSelectedRange: 0, criticalEvents: 0, blockedIps: 0, bruteForceAttempts: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Shield className="h-6 w-6" /><h1 className="text-2xl font-bold">Security Dashboard</h1></div>
        <div className="flex gap-2"><Button variant={timeRange === "24h" ? "default" : "outline"} onClick={() => setTimeRange("24h")} size="sm">24h</Button><Button variant={timeRange === "7d" ? "default" : "outline"} onClick={() => setTimeRange("7d")} size="sm">7d</Button><Button variant={timeRange === "30d" ? "default" : "outline"} onClick={() => setTimeRange("30d")} size="sm">30d</Button></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Security Events</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{securityStats.totalEvents.toLocaleString()}</div><p className="text-xs text-muted-foreground">{securityStats.eventsInSelectedRange ?? securityStats.events24h} {selectedWindowCountLabel}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Critical Events</CardTitle><AlertTriangle className="h-4 w-4 text-red-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{securityStats.criticalEvents}</div><p className="text-xs text-muted-foreground">Require immediate attention</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Blocked IPs</CardTitle><Ban className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{securityStats.blockedIps}</div><p className="text-xs text-muted-foreground">Currently blocked addresses</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Brute Force Attempts</CardTitle><Lock className="h-4 w-4 text-amber-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-amber-600">{securityStats.bruteForceAttempts}</div><p className="text-xs text-muted-foreground">Failed login attempts</p></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Recent Security Events</CardTitle><CardDescription>Latest security events and alerts across the system</CardDescription></CardHeader><CardContent>
        {eventsLoading ? (<div className="animate-pulse space-y-2">{[...Array(5)].map((_, i) => (<div key={i} className="h-12 bg-gray-200 rounded"></div>))}</div>) : (
        <Table><TableHeader><TableRow><TableHead>Event Type</TableHead><TableHead>Severity</TableHead><TableHead>IP Address</TableHead><TableHead>User</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
        <TableBody>{eventsData.slice(0, 10).map((event: Record<string, unknown>) => (
          <TableRow key={event.id as string}><TableCell><div className="flex items-center gap-2">{(event.type as string) === "BRUTE_FORCE" && <Lock className="h-4 w-4 text-red-500" />}{(event.type as string) === "SUSPICIOUS_LOGIN" && <AlertTriangle className="h-4 w-4 text-amber-500" />}{(event.type as string) === "NEW_DEVICE_LOGIN" && <Users className="h-4 w-4 text-blue-500" />}<span className="text-sm font-medium">{(event.type as string).replace(/_/g, " ")}</span></div></TableCell>
          <TableCell><Badge variant={(event.severity as string) === "CRITICAL" || (event.severity as string) === "HIGH" ? "destructive" : (event.severity as string) === "MEDIUM" ? "default" : "secondary"}>{event.severity as string}</Badge></TableCell>
          <TableCell><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{(event.ip as string) || "N/A"}</code></TableCell>
          <TableCell>{(event.email as string) || (event.userId as string) || "Anonymous"}</TableCell>
          <TableCell>{formatDistanceToNow(new Date(event.createdAt as string), { addSuffix: true })}</TableCell></TableRow>)) || (<TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No security events found</TableCell></TableRow>)}</TableBody></Table>)}
      </CardContent></Card>

      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Ban className="h-5 w-5" />Blocked IP Addresses</CardTitle><CardDescription>IP addresses currently blocked for security reasons</CardDescription></CardHeader><CardContent>
        {blockedIpsLoading ? (<div className="animate-pulse space-y-2">{[...Array(3)].map((_, i) => (<div key={i} className="h-12 bg-gray-200 rounded"></div>))}</div>) : (
        <Table><TableHeader><TableRow><TableHead>IP Address</TableHead><TableHead>Reason</TableHead><TableHead>Blocked By</TableHead><TableHead>Hit Count</TableHead><TableHead>Blocked At</TableHead></TableRow></TableHeader>
        <TableBody>{blockedIpsData.slice(0, 10).map((ip: Record<string, unknown>) => (
          <TableRow key={ip.ip as string}><TableCell><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{ip.ip as string}</code></TableCell><TableCell>{ip.reason as string}</TableCell><TableCell>{((ip.blocker as Record<string, unknown>)?.name as string) || "System"}</TableCell><TableCell><Badge variant="outline">{ip.hitCount as number}</Badge></TableCell><TableCell>{formatDistanceToNow(new Date(ip.createdAt as string), { addSuffix: true })}</TableCell></TableRow>)) || (<TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No blocked IPs found</TableCell></TableRow>)}</TableBody></Table>)}
      </CardContent></Card>

      <Card><CardHeader><CardTitle>Rate Limit Settings</CardTitle><CardDescription>Control API traffic thresholds used by the global rate limiter</CardDescription></CardHeader><CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><p className="text-sm font-medium">Global req/min per IP</p><Input value={globalPerMinuteInput || String(configData?.globalPerMinute ?? 100)} onChange={(e) => setGlobalPerMinuteInput(e.target.value)} inputMode="numeric" /></div>
        <div className="space-y-2"><p className="text-sm font-medium">Auth attempts / 15m</p><Input value={authPer15MinInput || String(configData?.authPer15Min ?? 5)} onChange={(e) => setAuthPer15MinInput(e.target.value)} inputMode="numeric" /></div>
        <div className="space-y-2"><p className="text-sm font-medium">Admin req/min</p><Input value={adminPerMinuteInput || String(configData?.adminPerMinute ?? 20)} onChange={(e) => setAdminPerMinuteInput(e.target.value)} inputMode="numeric" /></div></div>
        <div className="mt-4 flex items-center gap-2"><Button onClick={handleSaveRateLimits} disabled={updateRateLimitConfig.isPending}>{updateRateLimitConfig.isPending ? "Saving..." : "Save Rate Limits"}</Button><p className="text-xs text-muted-foreground">Changes apply within about one minute.</p></div>
      </CardContent></Card>

      <Card><CardHeader><CardTitle>Quick Security Actions</CardTitle><CardDescription>Common security management tasks</CardDescription></CardHeader><CardContent>
        <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />View All Events</Button><Button variant="outline" size="sm"><Ban className="h-4 w-4 mr-2" />Block IP Address</Button><Button variant="outline" size="sm"><Users className="h-4 w-4 mr-2" />User Sessions</Button><Button variant="outline" size="sm"><TrendingUp className="h-4 w-4 mr-2" />Security Reports</Button></div>
      </CardContent></Card>
    </div>
  );
}
