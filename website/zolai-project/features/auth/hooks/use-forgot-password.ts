"use client";

import { useState, useCallback } from "react";
import { forgotPassword } from "../lib/auth-api";

interface UseForgotPasswordReturn {
  sendResetEmail: (email: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const sendResetEmailFn = useCallback(
    async (email: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await forgotPassword(email);

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
    sendResetEmail: sendResetEmailFn,
    isLoading,
    error,
    clearError,
  };
}
