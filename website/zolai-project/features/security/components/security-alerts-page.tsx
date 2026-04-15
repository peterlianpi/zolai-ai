"use client";

import { formatDistanceToNow } from "date-fns";
import { 
  AlertTriangle,
  Shield,
  Check,
  X,
  Bell,
  MapPin,
  Smartphone,
  Key,
  Lock
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
import { toast } from "sonner";
import { useSecurityAlerts, useMarkAlertAsRead, useResolveAlert } from "../hooks/use-security";
import { SecurityAlertType, SecuritySeverity } from "../types";

function getAlertIcon(type: SecurityAlertType) {
  switch (type) {
    case SecurityAlertType.SUSPICIOUS_LOGIN:
      return <AlertTriangle className="h-4 w-4" />;
    case SecurityAlertType.NEW_DEVICE_LOGIN:
      return <Smartphone className="h-4 w-4" />;
    case SecurityAlertType.MULTIPLE_FAILED_LOGINS:
      return <X className="h-4 w-4" />;
    case SecurityAlertType.PASSWORD_BREACH_DETECTED:
      return <Key className="h-4 w-4" />;
    case SecurityAlertType.UNUSUAL_LOCATION_LOGIN:
      return <MapPin className="h-4 w-4" />;
    case SecurityAlertType.ACCOUNT_LOCKED:
      return <Lock className="h-4 w-4" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
}

function getSeverityColor(severity: SecuritySeverity) {
  switch (severity) {
    case SecuritySeverity.LOW:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case SecuritySeverity.MEDIUM:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case SecuritySeverity.HIGH:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case SecuritySeverity.CRITICAL:
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function getAlertTitle(type: SecurityAlertType) {
  switch (type) {
    case SecurityAlertType.SUSPICIOUS_LOGIN:
      return "Suspicious Login Detected";
    case SecurityAlertType.NEW_DEVICE_LOGIN:
      return "New Device Login";
    case SecurityAlertType.MULTIPLE_FAILED_LOGINS:
      return "Multiple Failed Login Attempts";
    case SecurityAlertType.PASSWORD_BREACH_DETECTED:
      return "Password Breach Detected";
    case SecurityAlertType.UNUSUAL_LOCATION_LOGIN:
      return "Unusual Location Login";
    case SecurityAlertType.ACCOUNT_LOCKED:
      return "Account Locked";
    default:
      return "Security Alert";
  }
}

export default function SecurityAlertsPage() {
  const { data: alerts, isLoading } = useSecurityAlerts();
  const markAsRead = useMarkAlertAsRead();
  const resolveAlert = useResolveAlert();

  interface SecurityAlert {
    id: string;
    type: string;
    severity: string;
    message: string;
    isRead: boolean;
    isResolved: boolean;
    createdAt: string;
  }

  const alertList = (
    alerts && typeof alerts === "object" && "data" in alerts && Array.isArray(alerts.data)
      ? alerts.data
      : []
  ) as SecurityAlert[];

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAsRead.mutateAsync(alertId);
      toast.success("Alert marked as read");
    } catch (_error) {
      toast.error("Failed to mark alert as read");
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlert.mutateAsync(alertId);
      toast.success("Alert resolved");
    } catch (_error) {
      toast.error("Failed to resolve alert");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Security Alerts</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const unreadAlerts = alertList.filter((alert) => !alert.isRead);
  const _readAlerts = alertList.filter((alert) => alert.isRead);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Security Alerts</h1>
          {unreadAlerts.length > 0 && (
            <Badge variant="destructive">{unreadAlerts.length} unread</Badge>
          )}
        </div>
      </div>

      {/* Unread Alerts */}
      {unreadAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Unread Alerts
            </CardTitle>
            <CardDescription>
              These alerts require your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unreadAlerts.map((alert: SecurityAlert) => (
                <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity as SecuritySeverity)}`}>
                      {getAlertIcon(alert.type as SecurityAlertType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{getAlertTitle(alert.type as SecurityAlertType)}</h3>
                        <Badge className={getSeverityColor(alert.severity as SecuritySeverity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(alert.id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark Read
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>All Security Alerts</CardTitle>
          <CardDescription>
            Complete history of your security alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alertList.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No security alerts</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Great! You haven&apos;t had any security alerts recently.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {alertList.map((alert) => (
                  <TableRow key={alert.id} className={alert.isRead ? "opacity-60" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.type as SecurityAlertType)}
                        <div>
                          <div className="font-medium">{getAlertTitle(alert.type as SecurityAlertType)}</div>
                          <div className="text-sm text-muted-foreground">
                            {alert.message}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(alert.severity as SecuritySeverity)}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {alert.isRead ? (
                          <Badge variant="secondary">Read</Badge>
                        ) : (
                          <Badge variant="destructive">Unread</Badge>
                        )}
                        {alert.isResolved && (
                          <Badge variant="default">Resolved</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!alert.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(alert.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                        {!alert.isResolved && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
