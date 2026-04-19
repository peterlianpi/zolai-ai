"use client";

import { formatDistanceToNow } from "date-fns";
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Shield, 
  MapPin, 
  Calendar,
  AlertTriangle,
  Trash2,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { toast } from "sonner";
import { useDeviceSessions, useRevokeDeviceSession, useRevokeAllOtherSessions } from "../hooks/use-security";

interface ApiDeviceSession {
  session: {
    id: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    expiresAt: string;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: {
    id: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
  };
}

function getDeviceTypeFromUserAgent(userAgent?: string | null): 'mobile' | 'desktop' | 'tablet' {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile';
  if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
  return 'desktop';
}

function getBrowserFromUserAgent(userAgent?: string | null): string {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getDeviceIcon(deviceType: string) {
  switch (deviceType.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'tablet':
      return <Tablet className="h-4 w-4" />;
    case 'desktop':
    default:
      return <Monitor className="h-4 w-4" />;
  }
}

export default function DeviceManagementPage() {
  const { data: sessions, isLoading } = useDeviceSessions();
  const revokeSession = useRevokeDeviceSession();
  const revokeAllOthers = useRevokeAllOtherSessions();
  const sessionList = (
    sessions && typeof sessions === "object" && "data" in sessions && Array.isArray(sessions.data)
      ? sessions.data
      : []
  ) as ApiDeviceSession[];

  const handleRevokeSession = async (sessionToken: string, deviceName: string) => {
    try {
      await revokeSession.mutateAsync(sessionToken);
      toast.success(`Successfully revoked session for ${deviceName}`);
    } catch (_error) {
      toast.error("Failed to revoke session");
    }
  };

  const handleRevokeAllOthers = async () => {
    try {
      await revokeAllOthers.mutateAsync();
      toast.success("Successfully revoked all other sessions");
    } catch (_error) {
      toast.error("Failed to revoke sessions");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Device Management</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (sessionList.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Device Management</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No sessions found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Unable to load device sessions at this time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For now, assume the first session is the current one (this is a simplified implementation)
  // In a real implementation, you'd need to identify the current session properly
  const currentSession = sessionList[0] as ApiDeviceSession;
  const otherSessions = sessionList.slice(1) as ApiDeviceSession[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Device Management</h1>
        </div>
        {otherSessions.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Revoke All Other Sessions
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke All Other Sessions?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will log you out of all other devices. You will need to sign in again on those devices.
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleRevokeAllOthers}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Revoke All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Current Session */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getDeviceIcon(getDeviceTypeFromUserAgent(currentSession.session.userAgent))}
              Current Session
              <Badge variant="default">Active</Badge>
            </CardTitle>
            <CardDescription>
              This is your current session on this device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium">Device</div>
                <div className="text-sm text-muted-foreground">
                  {getBrowserFromUserAgent(currentSession.session.userAgent)} - {getDeviceTypeFromUserAgent(currentSession.session.userAgent)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">IP Address</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {currentSession.session.ipAddress || 'Unknown'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Last Activity</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(currentSession.session.updatedAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Other Sessions</CardTitle>
          <CardDescription>
            These are your active sessions on other devices. You can revoke access for any device you don&apos;t recognize.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {otherSessions.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No other sessions</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You&apos;re only signed in on this device.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherSessions.map((sessionData: ApiDeviceSession) => {
                  const session = sessionData.session;
                  const deviceType = getDeviceTypeFromUserAgent(session.userAgent);
                  const browser = getBrowserFromUserAgent(session.userAgent);
                  const deviceName = `${browser} on ${deviceType}`;

                  return (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(deviceType)}
                          <div>
                            <div className="font-medium">{deviceName}</div>
                            <div className="text-sm text-muted-foreground">
                              {session.userAgent?.substring(0, 50) || 'Unknown device'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.ipAddress || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Revoke
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will log you out of {deviceName}. You will need to sign in again on that device.
                                This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRevokeSession(session.token, deviceName)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Revoke Session
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Security Tip */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold">Security Tip</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Regularly review your active sessions and revoke access for any devices you don&apos;t recognize. 
                If you see suspicious activity, change your password immediately and enable two-factor authentication.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
