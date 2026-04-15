"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, Smartphone, Bell } from "lucide-react";
import { useSecuritySettings, useUpdateSecuritySettings } from "@/features/security/hooks/use-security";
import { useState } from "react";
import { toast } from "sonner";

export default function SecuritySettingsPage() {
  const { data: settings, isLoading } = useSecuritySettings();
  const updateSettings = useUpdateSecuritySettings();
  
  const [localSettings, setLocalSettings] = useState({
    emailNotificationsEnabled: true,
    suspiciousActivityAlerts: true,
    newDeviceAlerts: true,
    locationBasedAlerts: false,
    sessionTimeout: 30,
    maxSessions: 5,
  });

  // Update local settings when data loads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (settings && !isLoading && (settings as any).success && (settings as any).data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (settings as any).data;
    if (localSettings.emailNotificationsEnabled !== data.emailNotificationsEnabled) {
      setLocalSettings(prev => ({ ...prev, ...data }));
    }
  }

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(localSettings);
      toast.success("Security settings updated");
    } catch (_error) {
      toast.error("Failed to update security settings");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Security Settings</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Security Settings</h1>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about security events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive security alerts via email
              </p>
            </div>
            <Switch
              checked={localSettings.emailNotificationsEnabled}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, emailNotificationsEnabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Suspicious activity alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified of unusual login attempts
              </p>
            </div>
            <Switch
              checked={localSettings.suspiciousActivityAlerts}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, suspiciousActivityAlerts: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New device alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your account is accessed from a new device
              </p>
            </div>
            <Switch
              checked={localSettings.newDeviceAlerts}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, newDeviceAlerts: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Location-based alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your account is accessed from a new location
              </p>
            </div>
            <Switch
              checked={localSettings.locationBasedAlerts}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, locationBasedAlerts: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            Control how long your sessions last and how many devices can be logged in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session timeout (minutes)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              min="5"
              max="1440"
              value={localSettings.sessionTimeout}
              onChange={(e) => 
                setLocalSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))
              }
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Automatically log out after this many minutes of inactivity
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxSessions">Maximum concurrent sessions</Label>
            <Input
              id="maxSessions"
              type="number"
              min="1"
              max="20"
              value={localSettings.maxSessions}
              onChange={(e) => 
                setLocalSettings(prev => ({ ...prev, maxSessions: parseInt(e.target.value) }))
              }
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Maximum number of devices that can be logged in simultaneously
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}