"use client";

import { Shield, Clock } from "lucide-react";
import {
  useAdminStats,
  useRecentActivity,
  useDashboardLayout,
  useQuickActionsLayout,
} from "../hooks/use-admin-stats";
import { DashboardBuilder, QuickActionsBuilder } from "./dashboard-builder";

export function AdminDashboard() {
  const { data: stats, isLoading, error } = useAdminStats();
  const { data: recentActivity } = useRecentActivity(5);
  const { 
    layout, 
    isLoading: isLayoutLoading, 
    isSaving: isSavingLayout, 
    saveLayout: saveLayout, 
    availableCards 
  } = useDashboardLayout();
  const { 
    layout: quickActionsLayout, 
    isLoading: isQuickActionsLoading, 
    isSaving: isSavingQuickActions, 
    saveLayout: saveQuickActionsLayout, 
    availableActions 
  } = useQuickActionsLayout();

  const formatAction = (action: string, entityType: string) => {
    return `${action.toLowerCase()} ${entityType.toLowerCase()}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const statsData = stats?.data;
  const isAnyLoading = isLoading || isLayoutLoading || isQuickActionsLoading;

  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      <DashboardBuilder
        layout={layout}
        availableCards={availableCards}
        stats={statsData}
        isLoading={isAnyLoading}
        error={!!error}
        isSaving={isSavingLayout}
        onSave={saveLayout}
      />

      <div className="flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Admin Dashboard
              </h2>
              <p className="text-muted-foreground">
                Manage users, datasets, content, media, and system settings for the Zolai AI platform.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <QuickActionsBuilder
              layout={quickActionsLayout}
              availableActions={availableActions}
              isSaving={isSavingQuickActions}
              onSave={saveQuickActionsLayout}
            />

            {recentActivity?.data && recentActivity.data.length > 0 && (
              <div className="rounded-lg border">
                <div className="flex items-center gap-2 p-4 border-b">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Recent Activity</h3>
                </div>
                <div className="divide-y">
                  {recentActivity.data.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium capitalize">{formatAction(log.action, log.entityType)}</p>
                        <p className="text-sm text-muted-foreground">
                          by {log.createdBy?.name || log.createdBy?.email || "System"}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border p-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Admin Panel Ready</h3>
              <p className="text-muted-foreground">
                Use this panel to manage users, datasets, content, media, redirects, and system settings for the Zolai AI platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
