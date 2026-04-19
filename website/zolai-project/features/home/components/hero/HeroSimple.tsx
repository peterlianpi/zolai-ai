"use client";

import { cn } from "@/lib/utils";
import type { HeroProps } from "../../types/hero";

/**
 * Simple Hero: Just title with optional breadcrumbs
 * Minimal styling, great for secondary pages
 */
export function HeroSimple({
  title,
  breadcrumbs = ["Home"],
  config,
}: HeroProps) {
  return (
    <section className="py-12 relative">
      <div className="container mx-auto px-4">
        <h1
          className={cn(
            "text-3xl sm:text-4xl font-bold mb-4",
            config?.alignment === "center" && "text-center",
            config?.alignment === "right" && "text-right",
          )}
        >
          {title}
        </h1>

        {config?.showBreadcrumbs && breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="breadcrumb">
            <ol
              className={cn(
                "flex gap-2 text-sm text-muted-foreground",
                config?.alignment === "center" && "justify-center",
                config?.alignment === "right" && "justify-end",
              )}
            >
              {breadcrumbs.map((item: string, index: number) => (
                <li key={index}>
                  {index > 0 && <span className="mx-1">/</span>}
                  <span className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </section>
  );
}
