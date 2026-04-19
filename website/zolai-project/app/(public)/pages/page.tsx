export const revalidate = 3600;
export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { Hero } from "@/features/home/components";
import { getPostList } from "@/action/content";
import { publicPostPath } from "@/lib/content-paths";
import { FileText } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  const description = `Resources and information from ${siteConfig.name}`;
  return {
    ...base,
    title: "Pages",
    description,
    openGraph: {
      ...base.openGraph,
      title: "Pages",
      description,
    },
    twitter: {
      ...base.twitter,
      title: "Pages",
      description,
    },
  };
}

export default async function PagesPage() {
  const result = await getPostList({
    type: "PAGE",
    limit: 100,
  });
  const { posts: pages } = result;

  return (
    <>
      <Hero title="Pages" breadcrumb={["Home", "Pages"]} />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {pages.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  href={publicPostPath("PAGE", page.slug, page.locale)}
                  className="group block rounded-lg border bg-card p-6 transition-colors hover:bg-muted/50 hover:shadow-md min-w-0"
                >
                  <FileText className="h-6 w-6 mb-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors" title={page.title}>
                    {page.title}
                  </h3>
                  {page.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {page.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pages found.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
