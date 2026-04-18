"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw, Trash2, Shield } from "lucide-react";
import { client } from "@/lib/api/client";

type SystemAction = "clear-sessions" | "clear-rate-limits" | "unblock-all" | "purge-security";

export function SystemActions() {
  const [confirmText, setConfirmText] = useState("");

  const run = useMutation({
    mutationFn: async (action: SystemAction) => {
      const routes = client.api.admin.system;
      const res = await (action === "clear-sessions" ? routes["clear-sessions"].$post()
        : action === "clear-rate-limits" ? routes["clear-rate-limits"].$post()
        : action === "unblock-all" ? routes["unblock-all"].$post()
        : routes["purge-security"].$post());
      return res.json() as unknown as { success: boolean; data: { deleted: number } };
    },
    onSuccess: (d, action) => {
      toast.success(`${action} completed — ${d.data?.deleted ?? 0} records removed`);
      setConfirmText("");
    },
    onError: () => toast.error("Action failed"),
  });

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">These actions are irreversible. Super Admin only.</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Clear expired sessions</p>
              <p className="text-xs text-muted-foreground">Remove all expired auth sessions from DB</p>
            </div>
            <Button size="sm" variant="outline" disabled={run.isPending} onClick={() => run.mutate("clear-sessions")}>
              {run.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Clear expired rate limits</p>
              <p className="text-xs text-muted-foreground">Remove stale rate limit records</p>
            </div>
            <Button size="sm" variant="outline" disabled={run.isPending} onClick={() => run.mutate("clear-rate-limits")}>
              {run.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Unblock all IPs</p>
              <p className="text-xs text-muted-foreground">Remove all IP blocks (use with caution)</p>
            </div>
            <Button size="sm" variant="outline" disabled={run.isPending} onClick={() => run.mutate("unblock-all")}>
              {run.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            </Button>
          </div>
          <div className="rounded-lg border border-destructive/30 p-3 space-y-2">
            <div>
              <p className="text-sm font-medium text-destructive">Purge all security events</p>
              <p className="text-xs text-muted-foreground">Permanently delete all security event logs</p>
            </div>
            <div className="flex gap-2">
              <Input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder='Type "PURGE" to confirm' className="h-8 text-xs" />
              <Button size="sm" variant="destructive" disabled={run.isPending || confirmText !== "PURGE"} onClick={() => run.mutate("purge-security")}>
                {run.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Purge"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
