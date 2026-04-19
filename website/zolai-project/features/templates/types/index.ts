export interface LayoutConfig {
  maxWidth: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding: "none" | "sm" | "md" | "lg";
  showHero: boolean;
  showBreadcrumb: boolean;
  showPageHeader: boolean;
  template: TemplateType;
}

export type TemplateType =
  | "default"
  | "full-width"
  | "sidebar"
  | "centered"
  | "blank";

export interface HeroConfig {
  variant: "simple" | "background" | "fullscreen" | "minimal";
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const MAX_WIDTH_CLASSES = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-full",
} as const;

export const PADDING_CLASSES = {
  none: "",
  sm: "px-4 py-6",
  md: "px-6 py-8",
  lg: "px-8 py-12",
} as const;
