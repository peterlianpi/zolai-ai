"use client";

import { useState, useCallback } from "react";
import { resendVerificationEmail } from "../lib/auth-api";

interface UseResendVerificationReturn {
  resend: (email: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useResendVerification(): UseResendVerificationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resendFn = useCallback(async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await resendVerificationEmail(email);

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
  }, []);

  return {
    resend: resendFn,
    isLoading,
    error,
    clearError,
  };
}
