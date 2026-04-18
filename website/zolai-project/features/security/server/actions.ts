'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function revokeDeviceSession(sessionId: string) {
  try {
    const res = await client.api.security["device-sessions"][":sessionId"]["revoke"].$post({
      param: { sessionId },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/security/devices');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to revoke session' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function revokeAllOtherSessions() {
  try {
    const res = await client.api.security["device-sessions"]["revoke-all-others"].$post();
    const data = await res.json();
    if (data.success) {
      revalidatePath('/security/devices');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to revoke sessions' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function markAlertAsRead(alertId: string) {
  try {
    const res = await client.api.security.alerts[":alertId"]["mark-read"].$post({
      param: { alertId },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/security/alerts');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to mark alert as read' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function resolveAlert(alertId: string) {
  try {
    const res = await client.api.security.alerts[":alertId"]["resolve"].$post({
      param: { alertId },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/security/alerts');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to resolve alert' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function updateSecuritySettings(settings: Record<string, unknown>) {
  try {
    const res = await client.api.security.settings.$put({ json: settings });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/security/settings');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to update settings' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function updateRateLimitConfig(config: Record<string, unknown>) {
  try {
    const res = await client.api.security["rate-limit-config"].$put({ json: config });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/security/settings');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to update rate limit config' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function silenceMonitorIncident(source: string, minutes?: number) {
  try {
    const res = await client.api.security.monitor.incidents[":source"].silence.$post({
      param: { source },
      json: { minutes },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/monitoring');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to silence incident' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function unsilenceMonitorIncident(source: string) {
  try {
    const res = await client.api.security.monitor.incidents[":source"].silence.$delete({
      param: { source },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/monitoring');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to unsilence incident' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
