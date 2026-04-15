import Link from "next/link";
import Image from "next/image";

import type { PostType } from "@/features/content/schemas";
import { publicPostPath } from "@/lib/content-paths";

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  type: PostType;
  locale: string;
  publishedAt: Date | null;
  featuredMedia: {
    url: string;
    altText: string | null;
  } | null;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  title?: string;
}

export function RelatedPosts({ posts, title = "Related Posts" }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={publicPostPath(post.type, post.slug, post.locale)}
            className="group block"
          >
            <div className="relative h-32 rounded-lg overflow-hidden mb-3">
              <Image
                src={post.featuredMedia?.url || "/placeholder.svg"}
                alt={post.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized={Boolean(post.featuredMedia?.url?.startsWith("http"))}
              />
            </div>
            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
}
