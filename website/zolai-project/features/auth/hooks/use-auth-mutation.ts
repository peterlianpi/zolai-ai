"use client";

import { useState, useCallback } from "react";
import type { LoginCredentials, RegisterData } from "../types/auth";
import { login, register } from "../lib/auth-api";

interface UseAuthMutationReturn<T> {
  mutate: (data: T) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

function createUseAuthMutation<T>(
  mutationFn: (data: T) => Promise<{ error?: string }>,
): () => UseAuthMutationReturn<T> {
  return function useAuthMutation() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => {
      setError(null);
    }, []);

    const mutate = useCallback(
      async (data: T): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
          const result = await mutationFn(data);

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
      mutate,
      isLoading,
      error,
      clearError,
    };
  };
}

export const useLogin = createUseAuthMutation<LoginCredentials>(login);
export const useRegister = createUseAuthMutation<RegisterData>(register);
