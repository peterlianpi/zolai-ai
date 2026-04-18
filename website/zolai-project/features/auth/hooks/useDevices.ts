'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/api/client';
import { toast } from 'sonner';

export interface Device {
  id: string;
  deviceName?: string;
  deviceType?: string;
  osName?: string;
  browserName?: string;
  country?: string;
  city?: string;
  ipAddress: string;
  isCurrentSession: boolean;
  lastActivityAt?: Date;
  createdAt: Date;
}

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await client.api.security["device-sessions"].$get();
      if (!res.ok) throw new Error('Failed to fetch devices');
      const data = await res.json() as unknown as { success: boolean; data: { devices: Device[] } };
      setDevices(data.data.devices);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const revokeDevice = async (sessionId: string, _reason?: string) => {
    try {
      const res = await client.api.security["device-sessions"][":sessionId"].revoke.$post({ param: { sessionId } });
      if (!res.ok) throw new Error('Failed to revoke device');
      await fetchDevices();
      toast.success('Device revoked');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke device');
    }
  };

  const revokeAllOthers = async () => {
    try {
      const res = await client.api.security["device-sessions"]["revoke-all-others"].$post();
      if (!res.ok) throw new Error('Failed to revoke sessions');
      await fetchDevices();
      toast.success('All other sessions revoked');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke sessions');
    }
  };

  useEffect(() => { fetchDevices(); }, []);

  return { devices, loading, error, revokeDevice, revokeAllOthers, refetch: fetchDevices };
}
