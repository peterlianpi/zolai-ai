"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw, Activity, Zap } from "lucide-react";
import { useState } from "react";
import { client } from "@/lib/api/client";

interface DevopsData {
  vpsHealth: { ok: boolean; status: number; latencyMs: number | null };
  aiStatus: Array<{ name: string; ok: boolean; latencyMs: number | null }>;
  timestamp: string;
}

export function AdminDevopsPage() {
  const [actionMsg, setActionMsg] = useState("");

  const { data, isLoading, refetch } = useQuery<DevopsData>({
    queryKey: ["admin-devops"],
    queryFn: async () => {
      const res = await client.api.admin.devops.$get();
      const json = await res.json() as unknown as { success: boolean; data: DevopsData };
      return json.data;
    },
    staleTime: 30_000,
  });

  const action = useMutation({
    mutationFn: async (act: "restart" | "rollback") => {
      const res = await client.api.admin.devops.$post({ json: { action: act } });
      return res.json() as unknown as { message?: string; error?: string };
    },
    onSuccess: (d) => {
      setActionMsg(d.message ?? d.error ?? "Done");
      setTimeout(() => setActionMsg(""), 4000);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">DevOps</h1>
          <p className="text-sm text-muted-foreground">VPS health, AI providers, deployments</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" /> VPS Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data ? (
            <div className="flex items-center gap-4">
              <Badge variant={data.vpsHealth.ok ? "default" : "destructive"}>{data.vpsHealth.ok ? "UP" : "DOWN"}</Badge>
              <span className="text-sm text-muted-foreground">HTTP {data.vpsHealth.status}</span>
              {data.vpsHealth.latencyMs !== null && <span className="text-sm text-muted-foreground">{data.vpsHealth.latencyMs}ms</span>}
              <span className="text-xs text-muted-foreground ml-auto">{new Date(data.timestamp).toLocaleTimeString()}</span>
            </div>
          ) : <div className="h-6 bg-muted animate-pulse rounded" />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4" /> AI Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data ? (
            <div className="space-y-2">
              {data.aiStatus.map(p => (
                <div key={p.name} className="flex items-center gap-3 text-sm">
                  <Badge variant={p.ok ? "default" : "destructive"} className="w-16 justify-center">{p.ok ? "OK" : "FAIL"}</Badge>
                  <span className="font-medium w-28">{p.name}</span>
                  <span className="text-muted-foreground">{p.latencyMs !== null ? `${p.latencyMs}ms` : "—"}</span>
                </div>
              ))}
            </div>
          ) : <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-6 bg-muted animate-pulse rounded" />)}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={() => action.mutate("restart")} disabled={action.isPending}>
              <RotateCcw className="w-4 h-4 mr-2" /> Restart Service
            </Button>
          </div>
          {actionMsg && <p className="text-sm text-muted-foreground">{actionMsg}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
