"use client";

import { cn } from "@/lib/utils";
import type { HeroProps } from "../../types/hero";

/**
 * Hero with Background: Title with background image/color overlay
 * Great for main landing pages, blog headers
 */
export function HeroWithBackground({
  title,
  subtitle,
  breadcrumbs = ["Home"],
  config,
  backgroundImage,
  backgroundColor,
}: HeroProps) {
  const bgStyle = backgroundColor
    ? { backgroundColor }
    : backgroundImage
      ? {}
      : { backgroundImage: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/.8) 100%)" };

  return (
    <section
      className="relative py-20 sm:py-32 overflow-hidden"
      style={{
        ...bgStyle,
        ...(backgroundImage && {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }),
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${config?.backgroundOverlay || 0.3})`,
        }}
      />

      <div className="container mx-auto px-4 relative text-center">
        <h1
          className={cn(
            "text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4",
            config?.alignment === "left" && "text-left",
            config?.alignment === "right" && "text-right",
          )}
        >
          {title}
        </h1>

        {subtitle && (
          <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}

        {config?.showBreadcrumbs && breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="breadcrumb">
            <ol
              className={cn(
                "flex gap-2 text-sm text-white/80 justify-center",
                config?.alignment === "left" && "justify-start",
                config?.alignment === "right" && "justify-end",
              )}
            >
              {breadcrumbs.map((item: string, index: number) => (
                <li key={index}>
                  {index > 0 && <span className="mx-1">/</span>}
                  <span
                    className={
                      index === breadcrumbs.length - 1 ? "text-white font-medium" : ""
                    }
                  >
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
