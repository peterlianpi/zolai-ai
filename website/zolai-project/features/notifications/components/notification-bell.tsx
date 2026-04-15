"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, useUnreadCount, useMarkNotificationRead } from "../hooks/use-notifications";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: notifications = [] } = useNotifications({ refetchInterval: 30_000 });
  const { data: unreadCount = 0 } = useUnreadCount({ refetchInterval: 30_000 });
  const markAsRead = useMarkNotificationRead();

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            Notifications ({unreadCount} unread)
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} unread</Badge>
          )}
        </div>
        <ScrollArea className="h-80">
          {recentNotifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer ${
                    !notification.read ? "bg-muted/20" : ""
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification.id);
                    }

                    if (notification.link) {
                      setOpen(false);
                      router.push(notification.link);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 5 && (
          <div className="p-2 border-t">
            <Button asChild variant="ghost" className="w-full">
              <Link href="/dashboard/notifications" onClick={() => setOpen(false)}>
                View all notifications
              </Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
