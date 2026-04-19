"use client";

import { useEffect } from "react";
import { PublicStatusPage } from "@/features/public/components/public-status-page";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return <PublicStatusPage code="!" title="Something went wrong" description="An unexpected error occurred. Please try again." retryLabel="Try Again" onRetry={reset} />;
}
