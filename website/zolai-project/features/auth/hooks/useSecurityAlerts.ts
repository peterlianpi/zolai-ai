'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/api/client';
import { toast } from 'sonner';

export interface SecurityAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  isResolved: boolean;
  createdAt: Date;
}

export function useSecurityAlerts() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await client.api.security.alerts.$get();
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const data = await res.json() as unknown as { success: boolean; data: SecurityAlert[] };
      if (data.success) {
        setAlerts(data.data);
        setUnread(data.data.filter(a => !a.isRead).length);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const res = await client.api.security.alerts[':alertId']['mark-read'].$post({ param: { alertId } });
      if (!res.ok) throw new Error('Failed to mark as read');
      await fetchAlerts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  const resolveAlert = async (alertId: string, _action?: 'confirm_login' | 'deny_login') => {
    try {
      const res = await client.api.security.alerts[':alertId'].resolve.$post({ param: { alertId } });
      if (!res.ok) throw new Error('Failed to resolve alert');
      await fetchAlerts();
      toast.success('Alert resolved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resolve alert');
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return { alerts, unread, loading, markAsRead, resolveAlert, refetch: fetchAlerts };
}
