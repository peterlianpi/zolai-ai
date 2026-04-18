"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, Smartphone, Bell } from "lucide-react";
import { useSecuritySettings, useUpdateSecuritySettings } from "@/features/security/hooks/use-security";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface LocalSettings {
  emailNotificationsEnabled: boolean;
  suspiciousActivityAlerts: boolean;
  newDeviceAlerts: boolean;
  locationBasedAlerts: boolean;
  sessionTimeout: number;
  maxSessions: number;
}

const DEFAULTS: LocalSettings = {
  emailNotificationsEnabled: true,
  suspiciousActivityAlerts: true,
  newDeviceAlerts: true,
  locationBasedAlerts: false,
  sessionTimeout: 30,
  maxSessions: 5,
};

export function SecuritySettingsPage() {
  const { data: settings, isLoading } = useSecuritySettings();
  const updateSettings = useUpdateSecuritySettings();
  const [local, setLocal] = useState<LocalSettings>(DEFAULTS);

  useEffect(() => {
    const d = (settings as { success?: boolean; data?: LocalSettings } | undefined)?.data;
    if (d) setLocal(prev => ({ ...prev, ...d }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(settings as { data?: LocalSettings } | undefined)?.data]);

  const set = (key: keyof LocalSettings, value: boolean | number) =>
    setLocal(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(local);
      toast.success("Security settings updated");
    } catch {
      toast.error("Failed to update security settings");
    }
  };

  if (isLoading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-2"><Shield className="h-6 w-6" /><h1 className="text-2xl font-bold">Security Settings</h1></div>
      <div className="animate-pulse space-y-4"><div className="h-32 bg-gray-200 rounded-lg" /><div className="h-64 bg-gray-200 rounded-lg" /></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2"><Shield className="h-6 w-6" /><h1 className="text-2xl font-bold">Security Settings</h1></div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notification Preferences</CardTitle><CardDescription>Choose how you want to be notified about security events</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          {([
            ["emailNotificationsEnabled", "Email notifications", "Receive security alerts via email"],
            ["suspiciousActivityAlerts", "Suspicious activity alerts", "Get notified of unusual login attempts"],
            ["newDeviceAlerts", "New device alerts", "Get notified when your account is accessed from a new device"],
            ["locationBasedAlerts", "Location-based alerts", "Get notified when your account is accessed from a new location"],
          ] as [keyof LocalSettings, string, string][]).map(([key, label, desc]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="space-y-0.5"><Label>{label}</Label><p className="text-sm text-muted-foreground">{desc}</p></div>
              <Switch checked={local[key] as boolean} onCheckedChange={(v) => set(key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />Session Management</CardTitle><CardDescription>Control how long your sessions last and how many devices can be logged in</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session timeout (minutes)</Label>
            <Input id="sessionTimeout" type="number" min="5" max="1440" value={local.sessionTimeout} onChange={(e) => set("sessionTimeout", parseInt(e.target.value))} className="w-32" />
            <p className="text-sm text-muted-foreground">Automatically log out after this many minutes of inactivity</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxSessions">Maximum concurrent sessions</Label>
            <Input id="maxSessions" type="number" min="1" max="20" value={local.maxSessions} onChange={(e) => set("maxSessions", parseInt(e.target.value))} className="w-32" />
            <p className="text-sm text-muted-foreground">Maximum number of devices that can be logged in simultaneously</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={updateSettings.isPending}>
        {updateSettings.isPending ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
