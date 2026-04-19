"use client";

import { ProtectedStatusPage } from "@/features/admin/components/protected-status-page";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Protected route error:", error);

  return (
    <ProtectedStatusPage
      code="!"
      title="Something went wrong"
      description="An unexpected error occurred while loading this protected page."
      onRetry={reset}
    />
  );
}
