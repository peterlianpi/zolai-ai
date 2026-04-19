import type { LayoutConfig, BreadcrumbItem, HeroConfig } from "../types";
import { PageContainer } from "./page-container";
import { Breadcrumb } from "./breadcrumb";
import { PageHeader } from "./page-header";
import { Hero } from "./hero";

interface PageLayoutProps {
  children: React.ReactNode;
  config?: Partial<LayoutConfig>;
  breadcrumbs?: BreadcrumbItem[];
  hero?: HeroConfig;
  pageTitle?: string;
  pageDescription?: string;
  pageHeader?: { title: string; description?: string };
  pageActions?: React.ReactNode;
  sidebar?: React.ReactNode;
  layout?: { maxWidth?: string; padding?: string };
  className?: string;
}

export function PageLayout({
  children,
  config,
  breadcrumbs,
  hero,
  pageTitle,
  pageDescription,
  pageHeader,
  pageActions,
  sidebar,
  layout,
  className,
}: PageLayoutProps) {
  const resolvedTitle = pageTitle ?? pageHeader?.title;
  const resolvedDescription = pageDescription ?? pageHeader?.description;
  const resolvedConfig: Partial<LayoutConfig> = {
    ...config,
    ...(layout?.maxWidth ? { maxWidth: layout.maxWidth as LayoutConfig["maxWidth"] } : {}),
    showBreadcrumb: !!(breadcrumbs?.length),
    showPageHeader: !!resolvedTitle,
  };

  const showHero = resolvedConfig?.showHero && hero;
  const template = resolvedConfig?.template || "default";

  return (
    <>
      {showHero && <Hero {...hero} />}
      
      <PageContainer config={resolvedConfig} className={className}>
        {breadcrumbs?.length && <Breadcrumb items={breadcrumbs} />}
        
        {resolvedTitle && (
          <PageHeader
            title={resolvedTitle}
            description={resolvedDescription}
            actions={pageActions}
          />
        )}

        {template === "sidebar" && sidebar ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">{children}</div>
            <aside className="lg:col-span-4">{sidebar}</aside>
          </div>
        ) : template === "centered" ? (
          <div className="max-w-3xl mx-auto">{children}</div>
        ) : (
          children
        )}
      </PageContainer>
    </>
  );
}
