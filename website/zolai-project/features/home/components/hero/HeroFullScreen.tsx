"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { HeroProps } from "../../types/hero";

/**
 * Fullscreen Hero: Large immersive hero section
 * Best for homepage, takes full viewport or large fixed height
 */
export function HeroFullScreen({
  title,
  subtitle,
  breadcrumbs = ["Home"],
  config,
  backgroundImage,
  backgroundColor,
}: HeroProps) {
  return (
    <section
      className="relative w-full min-h-[80vh] overflow-hidden flex items-center justify-center"
      style={{
        backgroundColor:
          backgroundColor ||
          "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/.8) 100%)",
      }}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={backgroundImage}
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${config?.backgroundOverlay || 0.4})`,
        }}
      />

      <div
        className={cn("container mx-auto px-4 relative", {
          "text-center": config?.alignment === "center",
          "text-left": config?.alignment === "left",
          "text-right": config?.alignment === "right",
        })}
      >
        <div
          className={cn(
            "max-w-3xl",
            config?.alignment === "center" && "mx-auto",
            config?.alignment === "right" && "ml-auto",
          )}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
              {subtitle}
            </p>
          )}

          {config?.showBreadcrumbs && breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="breadcrumb">
              <ol
                className={cn(
                  "flex gap-2 text-sm text-white/80",
                  config?.alignment === "center" && "justify-center",
                  config?.alignment === "right" && "justify-end",
                )}
              >
                {breadcrumbs.map((item: string, index: number) => (
                  <li key={index}>
                    {index > 0 && <span className="mx-1">/</span>}
                    <span
                      className={
                        index === breadcrumbs.length - 1
                          ? "text-white font-medium"
                          : ""
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
      </div>
    </section>
  );
}
