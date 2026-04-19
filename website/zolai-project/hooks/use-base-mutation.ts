import {
  useMutation,
  useQueryClient,
  type MutationFunction,
} from "@tanstack/react-query";
import { toast } from "sonner";

interface UseBaseMutationOptions<TData = unknown, TVariables = unknown> {
  mutationKey: string | string[];
  successMessage?: string;
  mutationFn: MutationFunction<TData, TVariables>;
  onSuccess?: () => void;
}

/**
 * Reusable mutation hook that standardizes success/error handlers.
 *
 * Reduces mutation boilerplate from ~8 lines to ~1 line per mutation.
 *
 * @example
 * // Before (8 lines of duplicated code)
 * useMutation({
 *   mutationFn: createPost,
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ["posts"] });
 *     toast.success("Post created successfully");
 *   },
 *   onError: (error: Error) => {
 *     toast.error(error.message);
 *   },
 * });
 *
 * // After (1 line)
 * useBaseMutation({
 *   mutationKey: ["posts"],
 *   successMessage: "Post created successfully",
 *   mutationFn: createPost,
 * });
 */
export function useBaseMutation<TData = unknown, TVariables = unknown>({
  mutationKey,
  successMessage,
  mutationFn,
  onSuccess,
}: UseBaseMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: Array.isArray(mutationKey) ? mutationKey : [mutationKey],
      });
      if (successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
