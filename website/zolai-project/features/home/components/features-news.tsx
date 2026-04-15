import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { publicPostPath } from "@/lib/content-paths";
import type {
  HomePostSummary,
  HomeTermSummary,
} from "@/features/home/server/get-home-page-data";

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

function Sidebar({ categories, tags, popularPosts }: { categories: HomeTermSummary[]; tags: HomeTermSummary[]; popularPosts: HomePostSummary[] }) {

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h6 className="text-xs font-normal uppercase tracking-wider mb-2">About</h6>
        <Image
          className="mx-auto mb-4 rounded-full"
          src="/logo.png"
          alt="Zolai AI Logo"
          width={96}
          height={96}
        />
        <p className="text-sm text-muted-foreground">
          Zolai AI is an open-source project preserving and teaching the Tedim Zolai language through AI, bilingual datasets, and interactive tools.
        </p>
      </div>

      {categories && categories.length > 0 && (
        <div>
          <h6 className="text-xs font-normal uppercase tracking-wider mb-4">Categories</h6>
          <ul className="space-y-2">
            {categories.slice(0, 10).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/news?category=${category.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary flex justify-between"
                >
                  <span>{category.name}</span>
                  <span className="text-xs">({category.count ?? 0})</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h6 className="text-xs font-normal uppercase tracking-wider mb-4">Popular Posts</h6>
          <PopularPostsList popularPosts={popularPosts} />
      </div>

      {tags && tags.length > 0 && (
        <div>
          <h6 className="text-xs font-normal uppercase tracking-wider mb-4">Tags</h6>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 15).map((tag) => (
              <Link
                key={tag.id}
                href={`/news?tag=${tag.slug}`}
                className="text-xs px-2 py-1 bg-muted rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <h6 className="text-xs font-normal uppercase tracking-wider mb-4">Explore</h6>
        <div className="flex justify-center gap-3">
          <Link href="/wiki" className="text-sm text-muted-foreground hover:text-primary">Wiki</Link>
          <Link href="/bible" className="text-sm text-muted-foreground hover:text-primary">Bible</Link>
          <Link href="/tutor" className="text-sm text-muted-foreground hover:text-primary">Tutor</Link>
        </div>
      </div>
    </div>
  );
}

function PopularPostsList({ popularPosts }: { popularPosts: HomePostSummary[] }) {
  if (!popularPosts?.length) return null;

  return (
    <div className="space-y-4">
      {popularPosts.map((post) => (
        <div key={post.id} className="flex gap-3">
          <Image
            src={post.featuredMedia?.url || "/placeholder.svg"}
            alt={post.title}
            width={80}
            height={64}
            className="h-16 w-16 object-cover rounded"
            unoptimized={Boolean(post.featuredMedia?.url?.startsWith("http"))}
          />
          <div>
            <h6 className="font-normal text-sm">
              <Link href={publicPostPath(post.type, post.slug, post.locale)} className="hover:text-primary">
                {post.title}
              </Link>
            </h6>
            <span className="text-xs text-muted-foreground">
              {formatDate(post.publishedAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeaturedPostsList({ featuredPosts }: { featuredPosts: HomePostSummary[] }) {

  if (!featuredPosts?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No featured posts available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {featuredPosts.map((post) => (
        <div key={post.id}>
          <Link href={publicPostPath(post.type, post.slug, post.locale)} className="block">
            <div className="relative h-48 rounded-lg overflow-hidden">
              <Image
                src={post.featuredMedia?.url || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                unoptimized={Boolean(post.featuredMedia?.url?.startsWith("http"))}
              />
            </div>
          </Link>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                {(post.terms ?? []).slice(0, 1).map((t) => (
                  <Link
                    key={t.term.id}
                    href={`/news?category=${t.term.slug}`}
                    className="text-xs font-normal uppercase tracking-wider text-muted-foreground hover:text-primary"
                  >
                    {t.term.name}
                  </Link>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(post.publishedAt)}
              </span>
            </div>
            <h5>
              <Link href={publicPostPath(post.type, post.slug, post.locale)} className="hover:text-primary">
                {post.title}
              </Link>
            </h5>
            <p className="text-sm text-muted-foreground mt-2">
              {truncateExcerpt(post.excerpt, 15)}
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

interface FeaturesNewsProps {
  featuredPosts: HomePostSummary[];
  popularPosts: HomePostSummary[];
  categories: HomeTermSummary[];
  tags: HomeTermSummary[];
}

export function FeaturesNews({ featuredPosts, popularPosts, categories, tags }: FeaturesNewsProps) {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold mb-6">All News</h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <FeaturedPostsList featuredPosts={featuredPosts} />
            <div className="mt-8 text-center">
              <Link href="/news">
                <Button variant="outline" size="lg" className="w-full md:w-auto">
                  More News
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-4">
            <Sidebar categories={categories} tags={tags} popularPosts={popularPosts} />
          </div>
        </div>
      </div>
    </section>
  );
}
