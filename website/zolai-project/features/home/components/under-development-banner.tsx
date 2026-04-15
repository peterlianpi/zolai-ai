"use client";

import { AlertTriangle } from "lucide-react";
import type { SiteSetting } from "@/features/settings/api";

interface UnderDevelopmentBannerProps {
  siteSettings?: SiteSetting[];
}

export function UnderDevelopmentBanner({
  siteSettings = [],
}: UnderDevelopmentBannerProps) {

  const isUnderDevelopment = siteSettings.find(
    (s) => s.key === "under_development"
  )?.value === "true";

  const message =
    siteSettings.find((s) => s.key === "under_development_message")?.value ||
    "We are improving the site. Some features may be unavailable.";

  if (!isUnderDevelopment) return null;

  return (
    <div className="bg-amber-100 dark:bg-amber-900/30 border-b border-amber-300 dark:border-amber-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
