import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroConfig } from "../types";

interface HeroProps extends Partial<HeroConfig> {
  className?: string;
}

export function Hero({
  variant = "simple",
  title,
  subtitle,
  backgroundImage,
  ctaText,
  ctaLink,
  className,
}: HeroProps) {
  const isFullscreen = variant === "fullscreen";
  const hasBackground = variant === "background" && backgroundImage;

  return (
    <section
      className={cn(
        "relative w-full bg-gradient-to-br from-primary/5 via-background to-primary/5",
        isFullscreen ? "min-h-[80vh] flex items-center" : "py-20 md:py-32",
        hasBackground && "bg-cover bg-center",
        className
      )}
      style={hasBackground ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {hasBackground && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {title && (
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
          {ctaText && ctaLink && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button asChild size="lg" className="text-base px-8 py-6 h-auto">
                <Link href={ctaLink}>
                  {ctaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-8 py-6 h-auto">
                <Link href="/learn">
                  Explore Lessons
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
