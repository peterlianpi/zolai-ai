"use client";

import { HeroSimple } from "./hero/HeroSimple";
import { HeroWithBackground } from "./hero/HeroWithBackground";
import { HeroFullScreen } from "./hero/HeroFullScreen";
import { HeroMinimal } from "./hero/HeroMinimal";
import type { HeroProps } from "../types/hero";

/**
 * HeroBuilder Component
 * 
 * Dynamically renders different hero styles based on configuration.
 * Respects database settings and supports mobile/tablet/desktop responsiveness.
 * 
 * Usage:
 * ```tsx
 * import { HeroBuilder } from '@/features/home/components/HeroBuilder';
 * 
 * <HeroBuilder
 *   title="Welcome"
 *   subtitle="Welcome to Zolai AI"
 *   breadcrumbs={['Home', 'News']}
 *   config={{
 *     style: 'background',
 *     background: '/hero-bg.jpg',
 *     alignment: 'center',
 *     showBreadcrumbs: true
 *   }}
 * />
 * ```
 */
export function HeroBuilder(props: HeroProps) {
  const style = props.config?.style || "simple";

  switch (style) {
    case "fullscreen":
      return <HeroFullScreen {...props} />;
    case "background":
      return <HeroWithBackground {...props} />;
    case "minimal":
      return <HeroMinimal {...props} />;
    case "simple":
    case "subtitle":
    default:
      return <HeroSimple {...props} />;
  }
}
