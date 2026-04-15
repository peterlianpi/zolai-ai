export interface PageTemplateProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  template?: string | null;
}

const templateAliases: Record<string, keyof typeof templates> = {
  standard: "default",
  page: "full-width",
  blog: "sidebar",
  magazine: "sidebar",
  landing: "full-width",
  minimal: "blank",
};

const templates = {
  "default": "grid grid-cols-1 lg:grid-cols-12 gap-8",
  "full-width": "max-w-4xl mx-auto",
  "sidebar": "grid grid-cols-1 lg:grid-cols-12 gap-8",
  "centered": "max-w-3xl mx-auto",
  "blank": "",
};

const contentWidths = {
  "default": "lg:col-span-8",
  "full-width": "w-full",
  "sidebar": "lg:col-span-8",
  "centered": "w-full",
  "blank": "w-full",
};

const sidebarWidths = {
  "default": "lg:col-span-4",
  "full-width": "",
  "sidebar": "lg:col-span-4",
  "centered": "",
  "blank": "",
};

export function PageTemplate({ children, sidebar, template = "default" }: PageTemplateProps) {
  const templateKey = resolveTemplateKey(template);
  
  const gridClass = templates[templateKey];
  const contentClass = contentWidths[templateKey];
  const sidebarClass = sidebarWidths[templateKey];
  
  if (template === "blank") {
    return <>{children}</>;
  }
  
  if (template === "full-width" || template === "centered") {
    return (
      <div className={gridClass}>
        <div className={contentClass}>
          {children}
        </div>
      </div>
    );
  }
  
  return (
    <div className={gridClass}>
      <div className={contentClass}>
        {children}
      </div>
      {sidebar && (
        <aside className={sidebarClass}>
          {sidebar}
        </aside>
      )}
    </div>
  );
}

export function PageTemplateClass(template?: string | null): string {
  const templateKey = resolveTemplateKey(template);
  return templates[templateKey];
}

export function ContentClass(template?: string | null): string {
  const templateKey = resolveTemplateKey(template);
  return contentWidths[templateKey];
}

export function SidebarClass(template?: string | null): string {
  const templateKey = resolveTemplateKey(template);
  return sidebarWidths[templateKey];
}

export function resolveTemplateKey(template?: string | null): keyof typeof templates {
  if (!template) return "default";

  if (template in templates) {
    return template as keyof typeof templates;
  }

  return templateAliases[template] ?? "default";
}
