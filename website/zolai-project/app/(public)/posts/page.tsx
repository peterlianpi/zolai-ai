export const revalidate = 3600;
export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { Hero } from "@/features/home/components";
import { PostCard } from "@/features/content/components/post-card";
import { getPostList } from "@/action/content";
import { PaginationWithParams } from "@/components/ui/pagination";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const base = buildSiteMetadata(siteConfig);
  const description = `Blog posts and articles from ${siteConfig.name}`;
  return {
    ...base,
    title: "Posts",
    description,
    openGraph: {
      ...base.openGraph,
      title: "Posts",
      description,
    },
    twitter: {
      ...base.twitter,
      title: "Posts",
      description,
    },
  };
}

const POSTS_PER_PAGE = 12;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const result = await getPostList({
    page,
    limit: POSTS_PER_PAGE,
    type: "POST",
    categorySlug: params.category,
    tagSlug: params.tag,
  });
  const { posts, totalPages } = result;

  return (
    <>
      <Hero title="Posts" breadcrumb={["Home", "Posts"]} />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {posts.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    title={post.title}
                    excerpt={post.excerpt}
                    publishedAt={post.publishedAt}
                    type={post.type}
                    slug={post.slug}
                    locale={post.locale}
                    isFeatured={post.isFeatured}
                    imageUrl={post.featuredMedia?.url ?? null}
                  />
                ))}
              </div>
              <br />
              {totalPages > 1 && (
                <PaginationWithParams
                  page={page}
                  totalPages={totalPages}
                  baseUrl="/posts"
                  extraParams={{
                    ...(params.category && { category: params.category }),
                    ...(params.tag && { tag: params.tag }),
                  }}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No posts found.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
