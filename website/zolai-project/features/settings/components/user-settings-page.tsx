"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Bell,
  Laptop,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Shield,
  User,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateProfileEmail, updateProfileName, updateUserPreferences } from "@/action/profile";
import { useSession } from "@/lib/auth-client";
import { useSessions } from "@/features/auth/hooks/use-sessions";
import { useUserPreferences } from "@/features/settings/hooks/use-user-preferences";
import { LanguageSwitcher } from "@/features/security/components/language-switcher";
import { formatMyanmarDate } from "@/lib/myanmar-calendar";
import { TwoFactorSettings } from "@/features/auth/components/two-factor-settings";
import { TelegramSettings } from "@/features/settings/components/telegram-settings";

export default function UserSettingsPage() {
  const {
    data: session,
    isPending: isLoadingSession,
    refetch: refetchSession,
  } = useSession();
  const {
    sessions,
    isLoading: isLoadingSessions,
    refreshSessions,
    signOutSession,
    signOutAllDevices,
  } = useSessions();
  const { data: preferences, isLoading: isLoadingPrefs } = useUserPreferences();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [tablePagination, setTablePagination] = useState("infinite");
  const [telegramChatId, setTelegramChatId] = useState<string | null>(null);
  const [telegramEnabled, setTelegramEnabled] = useState(false);

  useEffect(() => {
    if (preferences?.tablePagination) {
      setTablePagination(preferences.tablePagination);
    }
    if (preferences?.emailNotifications !== undefined) {
      setEmailNotifications(preferences.emailNotifications);
    }
    if (preferences?.inAppNotifications !== undefined) {
      setInAppNotifications(preferences.inAppNotifications);
    }
    if (preferences?.telegramChatId !== undefined) {
      setTelegramChatId(preferences.telegramChatId);
    }
    if (preferences?.telegramEnabled !== undefined) {
      setTelegramEnabled(preferences.telegramEnabled);
    }
  }, [preferences]);

  useEffect(() => {
    if (session?.user) {
      const userName = session.user.name || "";
      const names = userName.split(" ");
      setFirstName(names.slice(0, -1).join(" ") || "");
      setLastName(names.slice(-1).join(" ") || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  const handleTablePaginationChange = async (value: string) => {
    setTablePagination(value);
    setIsSavingPrefs(true);
    try {
      const result = await updateUserPreferences({ tablePagination: value });
      if (result.success) {
        toast.success("Table preference saved");
      } else {
        console.error("Failed to save preference:", result.error);
        toast.error(result.error || "Failed to save preference");
      }
    } catch (error) {
      console.error("Exception saving preference:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save preference");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleNotificationPreferenceChange = async (
    type: "emailNotifications" | "inAppNotifications",
    value: boolean
  ) => {
    if (type === "emailNotifications") {
      setEmailNotifications(value);
    } else {
      setInAppNotifications(value);
    }

    setIsSavingPrefs(true);
    try {
      const result = await updateUserPreferences({ [type]: value });
      if (result.success) {
        toast.success(`${type === "emailNotifications" ? "Email" : "In-app"} notifications ${value ? "enabled" : "disabled"}`);
      } else {
        toast.error(result.error || "Failed to save notification preference");
        // Revert on error
        if (type === "emailNotifications") {
          setEmailNotifications(!value);
        } else {
          setInAppNotifications(!value);
        }
      }
    } catch {
      toast.error("Failed to save notification preference");
      // Revert on error
      if (type === "emailNotifications") {
        setEmailNotifications(!value);
      } else {
        setInAppNotifications(!value);
      }
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();

      if (fullName !== session?.user?.name) {
        const result = await updateProfileName(fullName);
        if (!result.success) {
          throw new Error(result.error || "Failed to update name");
        }
      }

      if (email !== session?.user?.email) {
        const result = await updateProfileEmail(email);
        if (!result.success) {
          throw new Error(result.error || "Failed to update email");
        }
      }

      toast.success("Profile updated successfully");
      await refetchSession();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSessions();
    setIsRefreshing(false);
  };

  const handleSignOutAll = async () => {
    const success = await signOutAllDevices();
    if (success) {
      window.location.href = "/login";
    }
  };

  const formatSessionDate = (date: Date | string) => {
    return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
  };

  const getDeviceInfo = (userAgent?: string | null) => {
    if (!userAgent) return "Unknown Device";
    if (userAgent.includes("Chrome")) return "Chrome Browser";
    if (userAgent.includes("Firefox")) return "Firefox Browser";
    if (userAgent.includes("Safari")) return "Safari Browser";
    if (userAgent.includes("Edge")) return "Edge Browser";
    return "Unknown Device";
  };

  return (
    <div className="space-y-6 p-0">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Separator />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <User className="h-5 w-5" />
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isLoadingSession} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isLoadingSession} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoadingSession} />
          </div>
          <Button onClick={handleSaveProfile} disabled={isLoadingSession || isSavingProfile}>
            {isSavingProfile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Bell className="h-5 w-5" />
          <div>
            <CardTitle>Language & Regional Settings</CardTitle>
            <CardDescription>Choose your language and cultural preferences</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Language</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred language for the interface
              </p>
            </div>
            <LanguageSwitcher />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div>
              <Label>Today&apos;s Date</Label>
              <div className="mt-1 space-y-1">
                <p className="text-sm">
                  <strong>English:</strong> {format(new Date(), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Myanmar:</strong> {formatMyanmarDate(new Date())}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Shield className="h-5 w-5" />
          <div>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">Change your account password</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/settings/change-password"><Lock className="mr-2 h-4 w-4" />Change Password</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication Settings */}
      <TwoFactorSettings />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Laptop className="h-5 w-5" />
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Manage your active login sessions</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <Label>Current Sessions</Label>
              <p className="text-sm text-muted-foreground">
                {isLoadingSessions ? "Loading..." : `${sessions.length} active session${sessions.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="h-10 w-full sm:w-auto">
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {sessions.length > 0 && (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((sessionItem) => (
                <div key={sessionItem.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <Laptop className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{getDeviceInfo(sessionItem.userAgent)}</p>
                      <p className="truncate text-xs text-muted-foreground">{sessionItem.ipAddress || "Unknown IP"} • {formatSessionDate(sessionItem.createdAt)}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => signOutSession(sessionItem.id)} disabled={isLoadingSessions} className="h-10 w-full sm:h-9 sm:w-auto">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ))}
              {sessions.length > 5 && <p className="text-sm text-muted-foreground">And {sessions.length - 5} more...</p>}
            </div>
          )}

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="h-11 justify-start"><LogOut className="mr-2 h-4 w-4" />Sign out of other devices</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out of other devices?</AlertDialogTitle>
                  <AlertDialogDescription>This will sign you out of all other devices except this one.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRefresh}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-11 justify-start"><LogOut className="mr-2 h-4 w-4" />Sign out of all devices</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out of all devices?</AlertDialogTitle>
                  <AlertDialogDescription>This will sign you out of all devices including this one.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOutAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Sign out all</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Bell className="h-5 w-5" />
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={(value) => handleNotificationPreferenceChange("emailNotifications", value)}
              disabled={isSavingPrefs}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">Show notifications within the app</p>
            </div>
            <Switch
              checked={inAppNotifications}
              onCheckedChange={(value) => handleNotificationPreferenceChange("inAppNotifications", value)}
              disabled={isSavingPrefs}
            />
          </div>
        </CardContent>
      </Card>

      <TelegramSettings telegramChatId={telegramChatId} telegramEnabled={telegramEnabled} />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Laptop className="h-5 w-5" />
          <div>
            <CardTitle>Table Preferences</CardTitle>
            <CardDescription>Configure how tables load data</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Table Pagination</Label>
              <p className="text-sm text-muted-foreground">Choose how tables load data in admin panel</p>
            </div>
            <Select value={tablePagination} onValueChange={handleTablePaginationChange} disabled={isSavingPrefs || isLoadingPrefs}>
              <SelectTrigger className="w-[180px]">
                {isSavingPrefs || isLoadingPrefs ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading...</span> : <SelectValue />}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="infinite">Infinite Scroll</SelectItem>
                <SelectItem value="normal">Normal (Next/Previous)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
