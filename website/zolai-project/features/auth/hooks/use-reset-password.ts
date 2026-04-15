"use client";

import { useState, useCallback } from "react";
import { resetPassword } from "../lib/auth-api";

interface UseResetPasswordReturn {
  reset: (token: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useResetPassword(): UseResetPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetFn = useCallback(
    async (token: string, newPassword: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await resetPassword(token, newPassword);

        if (result.error) {
          setError(result.error);
          return false;
        }

        return true;
      } catch {
        setError("An unexpected error occurred");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    reset: resetFn,
    isLoading,
    error,
    clearError,
  };
}
