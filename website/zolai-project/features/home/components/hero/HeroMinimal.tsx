"use client";

import { cn } from "@/lib/utils";
import type { HeroProps } from "../../types/hero";

/**
 * Minimal Hero: Very compact, just essential title
 * Best for internal pages, secondary navigation
 */
export function HeroMinimal({
  title,
  config,
}: HeroProps) {
  return (
    <section className="py-6 border-b">
      <div className="container mx-auto px-4">
        <h1
          className={cn(
            "text-2xl sm:text-3xl font-semibold",
            config?.alignment === "center" && "text-center",
            config?.alignment === "right" && "text-right",
          )}
        >
          {title}
        </h1>
      </div>
    </section>
  );
}
