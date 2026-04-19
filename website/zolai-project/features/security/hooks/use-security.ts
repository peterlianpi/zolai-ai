import { client } from "@/lib/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeviceSessions() {
  return useQuery({
    queryKey: ["security", "device-sessions"],
    queryFn: async () => {
      const response = await client.api.security["device-sessions"].$get();
      if (!response.ok) {
        throw new Error("Failed to fetch device sessions");
      }
      return response.json();
    },
  });
}

export function useRevokeDeviceSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await client.api.security["device-sessions"][":sessionId"]["revoke"].$post({
        param: { sessionId },
      });
      if (!response.ok) {
        throw new Error("Failed to revoke device session");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "device-sessions"] });
    },
  });
}

export function useRevokeAllOtherSessions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await client.api.security["device-sessions"]["revoke-all-others"].$post();
      if (!response.ok) {
        throw new Error("Failed to revoke all other sessions");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "device-sessions"] });
    },
  });
}

export function useSecurityAlerts() {
  return useQuery({
    queryKey: ["security", "alerts"],
    queryFn: async () => {
      const response = await client.api.security.alerts.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch security alerts");
      }
      return response.json();
    },
  });
}

export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await client.api.security.alerts[":alertId"]["mark-read"].$post({
        param: { alertId },
      });
      if (!response.ok) {
        throw new Error("Failed to mark alert as read");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "alerts"] });
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await client.api.security.alerts[":alertId"]["resolve"].$post({
        param: { alertId },
      });
      if (!response.ok) {
        throw new Error("Failed to resolve alert");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "alerts"] });
    },
  });
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: ["security", "settings"],
    queryFn: async () => {
      const response = await client.api.security.settings.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch security settings");
      }
      return response.json();
    },
  });
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Record<string, unknown>) => {
      const response = await client.api.security.settings.$put({
        json: settings,
      });
      if (!response.ok) {
        throw new Error("Failed to update security settings");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "settings"] });
    },
  });
}

// Admin security hooks
export function useSecurityStats() {
  return useSecurityStatsByRange("24h");
}

export function useSecurityStatsByRange(timeRange: "24h" | "7d" | "30d") {
  return useQuery({
    queryKey: ["security", "stats", timeRange],
    queryFn: async () => {
      const response = await client.api.security.stats.$get({ query: { timeRange } });
      if (!response.ok) {
        throw new Error("Failed to fetch security stats");
      }
      return response.json();
    },
    refetchInterval: 15_000,
  });
}

export function useSecurityEvents(params: {
  type?: string;
  severity?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: ["security", "events", params],
    queryFn: async () => {
      const query: Record<string, string> = {};
      if (params.type) query.type = params.type;
      if (params.severity) query.severity = params.severity;
      if (params.page) query.page = params.page.toString();
      if (params.limit) query.limit = params.limit.toString();

      const response = await client.api.security.events.$get({ query });
      if (!response.ok) {
        throw new Error("Failed to fetch security events");
      }
      return response.json();
    },
    refetchInterval: 15_000,
  });
}

export function useBlockedIps() {
  return useQuery({
    queryKey: ["security", "blocked-ips"],
    queryFn: async () => {
      const response = await client.api.security["blocked-ips"].$get();
      if (!response.ok) {
        throw new Error("Failed to fetch blocked IPs");
      }
      return response.json();
    },
    refetchInterval: 15_000,
  });
}

export interface RateLimitConfigPayload {
  globalPerMinute: number;
  authPer15Min: number;
  adminPerMinute: number;
  autoBlockEnabled: boolean;
  autoBlockThreshold: number;
  autoBlockDurationMinutes: number;
}

export function useRateLimitConfig() {
  return useQuery({
    queryKey: ["security", "rate-limit-config"],
    queryFn: async () => {
      const response = await client.api.security["rate-limit-config"].$get();
      if (!response.ok) {
        throw new Error("Failed to fetch rate limit config");
      }
      return response.json();
    },
  });
}

export function useUpdateRateLimitConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: RateLimitConfigPayload) => {
      const response = await client.api.security["rate-limit-config"].$put({
        json: config,
      });
      if (!response.ok) {
        throw new Error("Failed to update rate limit config");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "rate-limit-config"] });
      queryClient.invalidateQueries({ queryKey: ["security", "stats"] });
    },
  });
}

export function useMonitorAlerts(limit = 50) {
  return useQuery({
    queryKey: ["security", "monitor", "alerts", limit],
    queryFn: async () => {
      const response = await client.api.security.monitor.alerts.$get({
        query: { limit: String(limit) },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch monitor alerts");
      }
      return response.json();
    },
    refetchInterval: 15_000,
  });
}

export function useMonitorIncidents() {
  return useQuery({
    queryKey: ["security", "monitor", "incidents"],
    queryFn: async () => {
      const response = await client.api.security.monitor.incidents.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch monitor incidents");
      }
      return response.json();
    },
    refetchInterval: 10_000,
  });
}

export function useSilenceMonitorIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ source, minutes }: { source: string; minutes?: number }) => {
      const response = await client.api.security.monitor.incidents[":source"].silence.$post({
        param: { source },
        json: { minutes },
      });
      if (!response.ok) {
        throw new Error("Failed to silence monitor incident");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "monitor", "incidents"] });
    },
  });
}

export function useUnsilenceMonitorIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (source: string) => {
      const response = await client.api.security.monitor.incidents[":source"].silence.$delete({
        param: { source },
      });
      if (!response.ok) {
        throw new Error("Failed to clear monitor incident silence");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "monitor", "incidents"] });
    },
  });
}
