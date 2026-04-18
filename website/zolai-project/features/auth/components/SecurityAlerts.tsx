'use client';

import { useSecurityAlerts } from '@/features/auth/hooks/useSecurityAlerts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const severityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const severityIcons = {
  LOW: <AlertTriangle className="h-4 w-4" />,
  MEDIUM: <AlertTriangle className="h-4 w-4" />,
  HIGH: <AlertTriangle className="h-4 w-4" />,
  CRITICAL: <AlertTriangle className="h-4 w-4" />,
};

export function SecurityAlerts() {
  const { alerts, unread, loading, resolveAlert } = useSecurityAlerts();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const unresolvedAlerts = alerts.filter(a => !a.isResolved);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Security Alerts</CardTitle>
            <CardDescription>Monitor suspicious activity on your account</CardDescription>
          </div>
          {unread > 0 && (
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {unread} New
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {unresolvedAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active security alerts
          </div>
        ) : (
          unresolvedAlerts.map(alert => (
            <div
              key={alert.id}
              className={`rounded-lg border p-4 ${
                alert.isRead ? 'bg-muted/30' : 'bg-white border-l-4 border-l-red-500'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {severityIcons[alert.severity]}
                    <span className="font-semibold">{alert.title}</span>
                    <Badge className={severityColors[alert.severity]}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>

                {!alert.isRead && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>{alert.title}</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-4">
                        <p>{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          Was this you? If not, your account may be compromised.
                        </p>
                      </AlertDialogDescription>
                      <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Dismiss</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => resolveAlert(alert.id, 'confirm_login')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Yes, That Was Me
                        </AlertDialogAction>
                        <AlertDialogAction
                          onClick={() => resolveAlert(alert.id, 'deny_login')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          No, Revoke Access
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {alert.isRead && !alert.isResolved && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
