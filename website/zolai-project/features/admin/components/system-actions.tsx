"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw, Trash2, Shield } from "lucide-react";

import { client } from "@/lib/api/client";

export function SystemActions() {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function runAction(action: string, label: string, requireConfirm?: string) {
    if (requireConfirm && confirmText !== requireConfirm) {
      toast.error(`Type "${requireConfirm}" to confirm`);
      return;
    }
    setLoading(action);
    try {
      const res = await client.api.admin.system[":action"].$post({ param: { action } });
      const json = await res.json();
      if ((json as { success?: boolean }).success) toast.success(`${label} completed`);
      else toast.error((json as { error?: { message?: string } }).error?.message || "Failed");
    } catch { toast.error("Action failed"); }
    finally { setLoading(null); setConfirmText(""); }
  }

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
            <Button size="sm" variant="outline" disabled={loading === "clear-sessions"} onClick={() => runAction("clear-sessions", "Clear sessions")}>
              {loading === "clear-sessions" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Clear expired rate limits</p>
              <p className="text-xs text-muted-foreground">Remove stale rate limit records</p>
            </div>
            <Button size="sm" variant="outline" disabled={loading === "clear-rate-limits"} onClick={() => runAction("clear-rate-limits", "Clear rate limits")}>
              {loading === "clear-rate-limits" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Unblock all IPs</p>
              <p className="text-xs text-muted-foreground">Remove all IP blocks (use with caution)</p>
            </div>
            <Button size="sm" variant="outline" disabled={loading === "unblock-all"} onClick={() => runAction("unblock-all", "Unblock all IPs")}>
              {loading === "unblock-all" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            </Button>
          </div>

          <div className="rounded-lg border border-destructive/30 p-3 space-y-2">
            <div>
              <p className="text-sm font-medium text-destructive">Purge all security events</p>
              <p className="text-xs text-muted-foreground">Permanently delete all security event logs</p>
            </div>
            <div className="flex gap-2">
              <Input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder='Type "PURGE" to confirm' className="h-8 text-xs" />
              <Button size="sm" variant="destructive" disabled={loading === "purge-security" || confirmText !== "PURGE"} onClick={() => runAction("purge-security", "Purge security events", "PURGE")}>
                {loading === "purge-security" ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Purge"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
