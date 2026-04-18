"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle, Users, Activity, Lock, Eye, Clock, Ban } from "lucide-react";
import { useSecurityStatsByRange, useSecurityEvents, useBlockedIps, useRateLimitConfig, useUpdateRateLimitConfig } from "@/features/security/hooks/use-security";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function AdminSecurityPage() {
  const [timeRange, setTimeRange] = useState("24h");
  const { data: stats, isLoading: statsLoading } = useSecurityStatsByRange(timeRange as "24h" | "7d" | "30d");
  const { data: events, isLoading: eventsLoading } = useSecurityEvents({ page: 1, limit: 10 });
  const { data: blockedIps } = useBlockedIps();
  const { data: rateLimitConfig } = useRateLimitConfig();
  const updateRateLimitConfig = useUpdateRateLimitConfig();
  
  const statsData = stats && "data" in stats ? stats.data : null;
  const eventsData = events && "data" in events ? events.data : [];
  const blockedIpsData = blockedIps && "data" in blockedIps ? blockedIps.data : [];
  const configData = rateLimitConfig && "data" in rateLimitConfig ? rateLimitConfig.data : null;

  const [globalPerMinuteInput, setGlobalPerMinuteInput] = useState("");
  const [authPer15MinInput, setAuthPer15MinInput] = useState("");
  const [adminPerMinuteInput, setAdminPerMinuteInput] = useState("");
  
  const [recaptchaSiteKeyInput, setRecaptchaSiteKey] = useState("");
  const [recaptchaSecretKeyInput, setRecaptchaSecretKey] = useState("");
  const [hcaptchaSiteKeyInput, setHcaptchaSiteKey] = useState("");
  const [hcaptchaSecretKeyInput, setHcaptchaSecretKey] = useState("");

  // Initialize inputs from configData — use derived values instead of setState in effect
  const recaptchaSiteKey = recaptchaSiteKeyInput || configData?.recaptchaSiteKey || "";
  const recaptchaSecretKey = recaptchaSecretKeyInput || configData?.recaptchaSecretKey || "";
  const hcaptchaSiteKey = hcaptchaSiteKeyInput || configData?.hcaptchaSiteKey || "";
  const hcaptchaSecretKey = hcaptchaSecretKeyInput || configData?.hcaptchaSecretKey || "";

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
    };
    
    if (!Number.isFinite(payload.globalPerMinute) || !Number.isFinite(payload.authPer15Min) || !Number.isFinite(payload.adminPerMinute)) {
      toast.error("Please enter valid numeric limits");
      return;
    }

    try {
      await updateRateLimitConfig.mutateAsync(payload);
      setGlobalPerMinuteInput("");
      setAuthPer15MinInput("");
      setAdminPerMinuteInput("");
      toast.success("Rate limit settings updated");
    } catch {
      toast.error("Failed to update rate limit settings");
    }
  };

  const handleSaveCaptcha = async () => {
    try {
      await updateRateLimitConfig.mutateAsync({
        recaptchaSiteKey,
        recaptchaSecretKey,
        hcaptchaSiteKey,
        hcaptchaSecretKey,
      });
      toast.success("CAPTCHA settings updated");
    } catch {
      toast.error("Failed to update CAPTCHA settings");
    }
  };

  if (statsLoading || eventsLoading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-2"><Shield className="h-6 w-6" /><h1 className="text-2xl font-bold">Security Dashboard</h1></div>
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (<div key={i} className="h-32 bg-gray-200 rounded-lg"></div>))}
      </div>
    </div>
  );

  const securityStats = statsData || { totalEvents: 0, events24h: 0, events7d: 0, events30d: 0, eventsInSelectedRange: 0, criticalEvents: 0, blockedIps: 0, bruteForceAttempts: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Shield className="h-6 w-6" /><h1 className="text-2xl font-bold">Security Dashboard</h1></div>
        <div className="flex gap-2">
          <Button variant={timeRange === "24h" ? "default" : "outline"} onClick={() => setTimeRange("24h")} size="sm">24h</Button>
          <Button variant={timeRange === "7d" ? "default" : "outline"} onClick={() => setTimeRange("7d")} size="sm">7d</Button>
          <Button variant={timeRange === "30d" ? "default" : "outline"} onClick={() => setTimeRange("30d")} size="sm">30d</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Security Events</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{securityStats.totalEvents.toLocaleString()}</div><p className="text-xs text-muted-foreground">{securityStats.eventsInSelectedRange ?? securityStats.events24h} {selectedWindowCountLabel}</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Critical Events</CardTitle><AlertTriangle className="h-4 w-4 text-red-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{securityStats.criticalEvents}</div><p className="text-xs text-muted-foreground">Require immediate attention</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Blocked IPs</CardTitle><Ban className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{securityStats.blockedIps}</div><p className="text-xs text-muted-foreground">Currently blocked addresses</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Brute Force Attempts</CardTitle><Lock className="h-4 w-4 text-amber-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-amber-600">{securityStats.bruteForceAttempts}</div><p className="text-xs text-muted-foreground">Failed login attempts</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Recent Security Events</CardTitle><CardDescription>Latest security events and alerts across the system</CardDescription></CardHeader><CardContent>
            <Table><TableHeader><TableRow><TableHead>Event Type</TableHead><TableHead>Severity</TableHead><TableHead>IP Address</TableHead><TableHead>User</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
            <TableBody>
              {eventsData.length > 0 ? eventsData.slice(0, 10).map((event: { id: string; type: string; severity: string; ip?: string | null; email?: string | null; userId?: string | null; createdAt: string }) => (
                <TableRow key={event.id}><TableCell><div className="flex items-center gap-2">{event.type === "BRUTE_FORCE" && <Lock className="h-4 w-4 text-red-500" />}{event.type === "SUSPICIOUS_LOGIN" && <AlertTriangle className="h-4 w-4 text-amber-500" />}{event.type === "NEW_DEVICE_LOGIN" && <Users className="h-4 w-4 text-blue-500" />}<span className="text-sm font-medium">{event.type.replace(/_/g, " ")}</span></div></TableCell>
                <TableCell><Badge variant={event.severity === "CRITICAL" || event.severity === "HIGH" ? "destructive" : event.severity === "MEDIUM" ? "default" : "secondary"}>{event.severity}</Badge></TableCell>
                <TableCell><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{event.ip || "N/A"}</code></TableCell>
                <TableCell>{event.email || event.userId || "Anonymous"}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}</TableCell></TableRow>)) : (<TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No security events found</TableCell></TableRow>)}
            </TableBody></Table>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Ban className="h-5 w-5" />Blocked IP Addresses</CardTitle><CardDescription>IP addresses currently blocked for security reasons</CardDescription></CardHeader><CardContent>
            <Table><TableHeader><TableRow><TableHead>IP Address</TableHead><TableHead>Reason</TableHead><TableHead>Blocked By</TableHead><TableHead>Hit Count</TableHead><TableHead>Blocked At</TableHead></TableRow></TableHeader>
            <TableBody>
              {blockedIpsData.length > 0 ? blockedIpsData.slice(0, 10).map((ip: { ip: string; reason: string; hitCount: number; createdAt: string; blocker?: { name: string } | null }) => (
                <TableRow key={ip.ip}><TableCell><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{ip.ip}</code></TableCell><TableCell>{ip.reason}</TableCell><TableCell>{ip.blocker?.name || "System"}</TableCell><TableCell><Badge variant="outline">{ip.hitCount}</Badge></TableCell><TableCell>{formatDistanceToNow(new Date(ip.createdAt), { addSuffix: true })}</TableCell></TableRow>)) : (<TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No blocked IPs found</TableCell></TableRow>)}
            </TableBody></Table>
          </CardContent></Card>
        </div>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Rate Limit Settings</CardTitle><CardDescription>Control API traffic thresholds</CardDescription></CardHeader><CardContent className="space-y-4">
            <div className="space-y-2"><p className="text-sm font-medium">Global req/min per IP</p><Input value={globalPerMinuteInput || String(configData?.globalPerMinute ?? 100)} onChange={(e) => setGlobalPerMinuteInput(e.target.value)} inputMode="numeric" /></div>
            <div className="space-y-2"><p className="text-sm font-medium">Auth attempts / 15m</p><Input value={authPer15MinInput || String(configData?.authPer15Min ?? 5)} onChange={(e) => setAuthPer15MinInput(e.target.value)} inputMode="numeric" /></div>
            <div className="space-y-2"><p className="text-sm font-medium">Admin req/min</p><Input value={adminPerMinuteInput || String(configData?.adminPerMinute ?? 20)} onChange={(e) => setAdminPerMinuteInput(e.target.value)} inputMode="numeric" /></div>
            <Button className="w-full" onClick={handleSaveRateLimits} disabled={updateRateLimitConfig.isPending}>{updateRateLimitConfig.isPending ? "Saving..." : "Save Rate Limits"}</Button>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>CAPTCHA Configuration</CardTitle><CardDescription>Manage bot protection keys</CardDescription></CardHeader><CardContent className="space-y-6">
            <div className="space-y-4 pt-2 border-t">
              <h3 className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Google reCAPTCHA v3</h3>
              <div className="space-y-2"><p className="text-xs font-medium">Site Key</p><Input value={recaptchaSiteKey} onChange={(e) => setRecaptchaSiteKey(e.target.value)} placeholder="6LfD..." /></div>
              <div className="space-y-2"><p className="text-xs font-medium">Secret Key</p><Input type="password" value={recaptchaSecretKey} onChange={(e) => setRecaptchaSecretKey(e.target.value)} placeholder="••••••••" /></div>
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-bold uppercase tracking-tight text-muted-foreground">hCaptcha</h3>
              <div className="space-y-2"><p className="text-xs font-medium">Site Key</p><Input value={hcaptchaSiteKey} onChange={(e) => setHcaptchaSiteKey(e.target.value)} placeholder="0x..." /></div>
              <div className="space-y-2"><p className="text-xs font-medium">Secret Key</p><Input type="password" value={hcaptchaSecretKey} onChange={(e) => setHcaptchaSecretKey(e.target.value)} placeholder="••••••••" /></div>
            </div>
            
            <Button className="w-full" onClick={handleSaveCaptcha} disabled={updateRateLimitConfig.isPending}>{updateRateLimitConfig.isPending ? "Saving..." : "Save CAPTCHA Keys"}</Button>
            <p className="text-[10px] text-center text-muted-foreground">Note: Environment variables take precedence if set.</p>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader><CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start"><Eye className="h-4 w-4 mr-2" /> All Events</Button>
              <Button variant="outline" size="sm" className="justify-start"><Ban className="h-4 w-4 mr-2" /> Block IP</Button>
              <Button variant="outline" size="sm" className="justify-start"><Users className="h-4 w-4 mr-2" /> Sessions</Button>
              <Button variant="outline" size="sm" className="justify-start"><Activity className="h-4 w-4 mr-2" /> Monitoring</Button>
            </div>
          </CardContent></Card>
        </div>
      </div>
    </div>
  );
}
