"use client";

import { useState } from "react";
import { Bot, Copy, Link2, Loader2, Unlink, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateUserPreferences } from "@/action/profile";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";

interface Props {
  telegramChatId: string | null;
  telegramEnabled: boolean;
}

export function TelegramSettings({ telegramChatId, telegramEnabled }: Props) {
  const qc = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(telegramEnabled);

  const botUsername = "zolaimonitor_bot";
  const botDisplayName = "Zolai System Monitor";
  const botUrl = `https://t.me/${botUsername}`;

  async function generateToken() {
    setLoading(true);
    try {
      const res = await client.api.telegram["link-token"].$post();
      const json = await res.json();
      if (!(json as { success?: boolean }).success) throw new Error((json as { error?: { message?: string } }).error?.message);
      setToken((json as { data: { token: string } }).data.token);
    } catch {
      toast.error("Failed to generate token");
    } finally {
      setLoading(false);
    }
  }

  async function unlink() {
    setLoading(true);
    try {
      const res = await client.api.telegram.unlink.$post();
      const json = await res.json();
      if (!(json as { success?: boolean }).success) throw new Error((json as { error?: { message?: string } }).error?.message);
      toast.success("Telegram unlinked");
      qc.invalidateQueries({ queryKey: ["user-preferences"] });
    } catch {
      toast.error("Failed to unlink");
    } finally {
      setLoading(false);
    }
  }

  async function toggleEnabled() {
    setLoading(true);
    try {
      await updateUserPreferences({ telegramEnabled: !enabled });
      setEnabled(!enabled);
      toast.success(enabled ? "Notifications disabled" : "Notifications enabled");
      qc.invalidateQueries({ queryKey: ["user-preferences"] });
    } catch {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  }

  function copyToken() {
    if (token) {
      navigator.clipboard.writeText(`/link ${token}`);
      toast.success("Copied! Paste this in the Telegram bot.");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <Bot className="h-5 w-5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle>Telegram</CardTitle>
            <a href={botUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              @{botUsername} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <CardDescription>{botDisplayName} · System monitoring & notifications</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {telegramChatId ? (
          <>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>Linked Chat ID</Label>
                <p className="font-mono text-sm text-muted-foreground">{telegramChatId}</p>
              </div>
              <Button variant="outline" size="sm" onClick={unlink} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Unlink className="mr-2 h-4 w-4" />Unlink</>}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive system alerts & updates</p>
              </div>
              <Switch checked={enabled} onCheckedChange={toggleEnabled} disabled={loading} />
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
              <p className="font-semibold">Available Commands:</p>
              <div className="grid grid-cols-2 gap-1 font-mono text-xs">
                {["/stats", "/users", "/dict", "/bible", "/wiki", "/lessons", "/health", "/uptime", "/me", "/help"].map(cmd => (
                  <span key={cmd} className="text-muted-foreground">{cmd}</span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-sm space-y-2">
              <p className="font-semibold text-blue-900 dark:text-blue-100">How to Link:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Open <a href={botUrl} target="_blank" rel="noreferrer" className="underline font-semibold">@{botUsername}</a> on Telegram</li>
                <li>Click &quot;Start&quot; or send /start</li>
                <li>Generate a token below</li>
                <li>Send <code className="bg-white dark:bg-slate-900 px-1 rounded">/link TOKEN</code> to the bot</li>
              </ol>
            </div>
            {token ? (
              <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
                <code className="flex-1 text-sm font-mono">/link {token}</code>
                <Button size="sm" variant="ghost" onClick={copyToken}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={generateToken} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                Generate Link Token
              </Button>
            )}
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-3 text-sm space-y-1">
              <p className="font-semibold text-amber-900 dark:text-amber-100">Bot Features:</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-200 text-xs">
                <li>📊 Real-time stats (users, dictionary, Bible, wiki, lessons)</li>
                <li>🔐 Account linking & management</li>
                <li>⏱ System health & uptime monitoring</li>
                <li>🛡 Security events (admin only)</li>
                <li>🏋 Training run status (admin only)</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
