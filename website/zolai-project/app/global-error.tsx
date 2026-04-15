"use client";

import { useEffect } from "react";
import { PublicStatusPage } from "@/features/public/components/public-status-page";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <PublicStatusPage
          code="500"
          title="Server Error"
          description="A critical error occurred. Please refresh the page or contact support."
          retryLabel="Try Again"
          onRetry={reset}
        />
      </body>
    </html>
  );
}
