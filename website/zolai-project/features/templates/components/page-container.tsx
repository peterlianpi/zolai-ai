import { cn } from "@/lib/utils";
import type { LayoutConfig } from "../types";
import { MAX_WIDTH_CLASSES, PADDING_CLASSES } from "../types";

interface PageContainerProps {
  children: React.ReactNode;
  config?: Partial<LayoutConfig>;
  className?: string;
}

const DEFAULT_CONFIG: LayoutConfig = {
  maxWidth: "xl",
  padding: "md",
  showHero: false,
  showBreadcrumb: false,
  showPageHeader: true,
  template: "default",
};

export function PageContainer({
  children,
  config,
  className,
}: PageContainerProps) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const maxWidthClass = MAX_WIDTH_CLASSES[finalConfig.maxWidth];
  const paddingClass = PADDING_CLASSES[finalConfig.padding];

  return (
    <div
      className={cn(
        "container mx-auto",
        maxWidthClass,
        paddingClass,
        className
      )}
    >
      {children}
    </div>
  );
}
