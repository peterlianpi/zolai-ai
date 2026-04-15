import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const termBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      taxonomy: {
        category: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        post_tag: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        new_categories: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        new_tags: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      },
    },
    defaultVariants: {
      taxonomy: "post_tag",
    },
  }
);

export interface TermBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof termBadgeVariants> {
  name: string;
  slug: string;
  taxonomyName: string;
}

export function TermBadge({
  name,
  taxonomyName,
  className,
  ...props
}: TermBadgeProps) {
  return (
    <span
      className={cn(termBadgeVariants({ taxonomy: taxonomyName as VariantProps<typeof termBadgeVariants>["taxonomy"] }), className)}
      title={`${name} (${taxonomyName})`}
      {...props}
    >
      {name}
    </span>
  );
}
