import Link from "next/link";
import Image from "next/image";
import { publicPostPath } from "@/lib/content-paths";
import type { HomePostSummary } from "@/features/home/server/get-home-page-data";

function formatDate(dateString: Date | string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function truncateExcerpt(excerpt: string | null, words: number) {
  if (!excerpt) return "";
  const wordArray = excerpt.split(" ");
  if (wordArray.length <= words) return excerpt;
  return wordArray.slice(0, words).join(" ") + "...";
}

function TrendingPostsList({ trendingPosts }: { trendingPosts: HomePostSummary[] }) {

  if (!trendingPosts?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No trending posts available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trendingPosts.map((post) => (
        <div key={post.id} className="group">
          <Link href={publicPostPath(post.type, post.slug, post.locale)}>
            <div className="relative h-40 rounded-lg overflow-hidden">
              <Image
                src={post.featuredMedia?.url || "/placeholder.svg"}
                alt={post.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover hover:scale-105 transition-transform duration-300"
                unoptimized={Boolean(post.featuredMedia?.url?.startsWith("http"))}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 px-3">
                <span className="text-xs text-white">
                  {formatDate(post.publishedAt)}
                </span>
              </div>
            </div>
          </Link>
          <div className="mt-3">
            <h5 className="font-medium">
              <Link href={publicPostPath(post.type, post.slug, post.locale)} className="hover:text-primary">
                {post.title}
              </Link>
            </h5>
            <p className="text-sm text-muted-foreground mt-1">
              {truncateExcerpt(post.excerpt, 12)}
            </p>
            <div className="mt-4 text-right">
              <Link
                href={publicPostPath(post.type, post.slug, post.locale)}
                className="text-sm text-primary hover:underline"
              >
                Read More
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrendingNow({ trendingPosts }: { trendingPosts: HomePostSummary[] }) {
  return (
    <section className="py-8 bg-muted/50">
      <div className="container mx-auto px-4">
        <h3 className="text-lg font-bold mb-6">LICENSE</h3>
        <TrendingPostsList trendingPosts={trendingPosts} />
      </div>
    </section>
  );
}
