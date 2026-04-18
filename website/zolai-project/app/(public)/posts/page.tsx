export const revalidate = 3600;
export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { buildSiteMetadata, getSiteConfig } from "@/lib/site-config";
import { PageTitle } from "@/features/home/components";
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
    status: "PUBLISHED",
    categorySlug: params.category,
    tagSlug: params.tag,
  });
  // Also fetch private posts to show in listing with members badge
  const privateResult = await getPostList({
    page,
    limit: POSTS_PER_PAGE,
    type: "POST",
    status: "PRIVATE" as never,
    categorySlug: params.category,
    tagSlug: params.tag,
  });
  const allPosts = [...result.posts, ...privateResult.posts].sort(
    (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
  );
  const { totalPages } = result;

  return (
    <>
      <PageTitle title="Posts" className="max-w-6xl" />

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {allPosts.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {allPosts.map((post) => (
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
                    isPrivate={post.status === "PRIVATE"}
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
            <div className="text-center py-8 text-muted-foreground">
              No posts found.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
