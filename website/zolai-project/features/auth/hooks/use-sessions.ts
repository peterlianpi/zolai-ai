"use client";

import { useState, useCallback } from "react";
import {
  getUserSessions,
  signOutSession,
  signOutOtherDevices,
  signOutAllDevices,
} from "@/action/session";
import { toast } from "sonner";

interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

interface UseSessionsReturn {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  refreshSessions: () => Promise<void>;
  signOutSession: (sessionId: string) => Promise<boolean>;
  signOutOtherDevices: () => Promise<boolean>;
  signOutAllDevices: () => Promise<boolean>;
}

export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserSessions();

      if (result.success && result.data) {
        setSessions(result.data || []);
      } else {
        setError(result.error || "Failed to fetch sessions");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOutSessionFn = useCallback(
    async (sessionId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await signOutSession(sessionId);

        if (result.success) {
          setSessions((prev) => prev.filter((s) => s.id !== sessionId));
          toast.success("Session ended successfully");
          return true;
        } else {
          setError(result.error || "Failed to sign out session");
          toast.error(result.error || "Failed to sign out session");
          return false;
        }
      } catch {
        setError("An unexpected error occurred");
        toast.error("An unexpected error occurred");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const signOutOtherDevicesFn = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signOutOtherDevices();

      if (result.success) {
        // Keep only the current session (we need to identify it)
        setSessions([]);
        toast.success("Signed out from other devices");
        return true;
      } else {
        setError(result.error || "Failed to sign out other devices");
        toast.error(result.error || "Failed to sign out other devices");
        return false;
      }
    } catch {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOutAllDevicesFn = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signOutAllDevices();

      if (result.success) {
        setSessions([]);
        toast.success("Signed out from all devices");
        return true;
      } else {
        setError(result.error || "Failed to sign out all devices");
        toast.error(result.error || "Failed to sign out all devices");
        return false;
      }
    } catch {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sessions,
    isLoading,
    error,
    refreshSessions,
    signOutSession: signOutSessionFn,
    signOutOtherDevices: signOutOtherDevicesFn,
    signOutAllDevices: signOutAllDevicesFn,
  };
}
