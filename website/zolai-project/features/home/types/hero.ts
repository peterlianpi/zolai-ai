/**
 * Hero section types and configuration
 */

export type HeroStyle = "simple" | "background" | "subtitle" | "fullscreen" | "minimal";
export type HeroAlignment = "left" | "center" | "right";

export interface HeroConfig {
  style: HeroStyle;
  background?: string; // URL or color
  showBreadcrumbs: boolean;
  backgroundOverlay: number; // Opacity 0-1
  alignment: HeroAlignment;
}

export interface HeroProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: string[];
  config?: Partial<HeroConfig>;
  backgroundImage?: string;
  backgroundColor?: string;
}

export const HERO_STYLES = ["simple", "background", "subtitle", "fullscreen", "minimal"] as const;
export const HERO_ALIGNMENTS = ["left", "center", "right"] as const;
