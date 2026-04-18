"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/features/notifications/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import Link from "next/link";

function formatTime(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return d.toLocaleDateString();
}

function formatReadAt(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleString();
}

export function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  // Track which notifications are being marked as read for visual feedback
  const [markingReadIds, setMarkingReadIds] = React.useState<Set<string>>(
    new Set(),
  );

  const unreadCount = notifications?.filter((n: { read: boolean }) => !n.read).length ?? 0;

  const handleMarkAsRead = (id: string) => {
    setMarkingReadIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
    markAsRead.mutate(id, {
      onSettled: () => {
        setMarkingReadIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      },
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => {
        toast.success("All notifications marked as read");
      },
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            You have {unreadCount} unread notification
            {unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4 mr-2" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
               {notifications.map((notification: { id: string; title: string; description: string; read: boolean; createdAt: string; readAt: string | null; link?: string | null; action?: string | null; actorName?: string | null }) => (
                <div key={notification.id}>
                  <div
                    className={`flex items-start justify-between gap-4 p-4 rounded-lg transition-all cursor-pointer ${
                      !notification.read ? "bg-muted/50" : "opacity-70"
                    } ${
                      markingReadIds.has(notification.id)
                        ? "ring-2 ring-primary/20"
                        : ""
                    } ${
                      notification.read ? "hover:opacity-100" : ""
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                        {notification.read && (
                          <span className="text-xs text-muted-foreground">
                            Read
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                      {notification.actorName && notification.action && (
                        <p className="text-xs text-muted-foreground">
                          {notification.actorName} • {notification.action}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Created: {formatTime(notification.createdAt)}
                        </span>
                        {notification.readAt && (
                          <span className="text-green-600">
                            Read at: {formatReadAt(notification.readAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.link && (
                        <Button asChild size="sm" variant="link" className="px-0">
                          <Link href={notification.link}>Open</Link>
                        </Button>
                      )}
                      {!notification.read ? (
                        <span
                          className={`text-xs text-muted-foreground ${
                            markingReadIds.has(notification.id)
                              ? "animate-pulse"
                              : ""
                          }`}
                        >
                          {markingReadIds.has(notification.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Click to mark read"
                          )}
                        </span>
                      ) : (
                        <CheckCheck className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
