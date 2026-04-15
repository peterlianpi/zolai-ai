import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { publicPostPath } from "@/lib/content-paths";
import type { HomePostSummary } from "@/features/home/server/get-home-page-data";

interface CarouselNewsProps {
  posts: HomePostSummary[];
}

export function CarouselNews({ posts }: CarouselNewsProps) {
  if (!posts?.length) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">TOP STORIES</h1>
        <Carousel
          className="w-full"
          opts={{
            loop: true,
            align: "start",
          }}
        >
          <CarouselContent>
            {posts.map((post, index) => (
              <CarouselItem key={post.id}>
                <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden group">
                  <Image
                    src={
                     post.featuredMedia?.url || "/placeholder.svg"
                    }
                    alt={post.title}
                    fill
                    sizes="100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={index === 0}
                    unoptimized={Boolean(post.featuredMedia?.url?.startsWith("http"))}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="hidden lg:block text-white/90 font-medium mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div>
                      <Link
                        href={publicPostPath(post.type, post.slug, post.locale)}
                        className="inline-block px-6 py-2.5 rounded-md border-2 border-white text-white font-medium hover:bg-white hover:text-black transition-colors duration-300"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
