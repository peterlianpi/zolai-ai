interface PageTitleProps {
  title: string;
  description?: string;
  className?: string;
}

/** Minimal page heading for inner pages — no hero banner, no breadcrumb */
export function PageTitle({ title, description, className }: PageTitleProps) {
  return (
    <div className={`container mx-auto px-4 pt-10 pb-6 ${className ?? ""}`}>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}
