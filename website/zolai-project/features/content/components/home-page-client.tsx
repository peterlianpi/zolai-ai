"use client";

import Link from "next/link";
import Image from "next/image"
import { PostCard } from "@/features/content/components/post-card";
import { SITE_CONSTANTS } from "@/lib/constants/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, Info, FileText } from "lucide-react";
import { landingConfig } from "@/lib/config/landing";

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | null;
  type: "POST" | "PAGE" | "NEWS";
  slug: string;
  locale: string;
  isFeatured: boolean;
  featuredMedia?: { url: string } | null;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  locale: string;
}

interface HomePageClientProps {
  featuredPosts: Post[];
  latestNews: Post[];
  pages: Page[];
  latestPosts: Post[];
}

export default function HomePageClient({
  featuredPosts,
  latestNews,
  pages,
  latestPosts,
}: HomePageClientProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[60vh] sm:min-h-[70vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/og.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Color Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/95 pointer-events-none" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-[1] py-16 sm:py-24">
          <Badge variant="secondary" className="mb-4">
            {landingConfig.hero.badge}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
            {landingConfig.hero.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {landingConfig.hero.description}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button asChild size="lg">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/tutor">
                Try the Tutor
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/about">
                <Info className="mr-2 h-4 w-4" /> About
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {landingConfig.quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="group">
                <div className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/50 h-full flex flex-col">
                  <Icon className="h-8 w-8 mb-3 text-primary" />
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Posts Carousel */}
      {featuredPosts.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Posts</h2>
            <Link
              href="/posts"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              View all posts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {featuredPosts.map((post) => (
                  <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/3">
                    <PostCard
                      title={post.title}
                      excerpt={post.excerpt}
                      publishedAt={post.publishedAt}
                      type={post.type as "POST" | "PAGE" | "NEWS"}
                      slug={post.slug}
                      locale={post.locale}
                      isFeatured={post.isFeatured}
                      imageUrl={post.featuredMedia?.url ?? null}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 sm:left-2" />
              <CarouselNext className="right-2 sm:right-2" />
            </Carousel>
          </div>
        </section>
      )}

      {/* Latest Posts Carousel */}
      {latestPosts.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Posts</h2>
            <Link
              href="/posts"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              View all posts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {latestPosts.map((post) => (
                  <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/3">
                    <PostCard
                      title={post.title}
                      excerpt={post.excerpt}
                      publishedAt={post.publishedAt}
                      type={post.type as "POST" | "PAGE" | "NEWS"}
                      slug={post.slug}
                      locale={post.locale}
                      isFeatured={post.isFeatured}
                      imageUrl={post.featuredMedia?.url ?? null}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 sm:left-2" />
              <CarouselNext className="right-2 sm:right-2" />
            </Carousel>
          </div>
        </section>
      )}

      {/* Latest News Carousel */}
      {latestNews.length > 0 && (
        <section className="container mx-auto px-4 py-12 bg-muted/30 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Latest News</h2>
              <p className="text-muted-foreground">Stay updated with the latest Zolai language news</p>
            </div>
            <Link
              href="/news"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              View all news <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {latestNews.map((post) => (
                  <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/3">
                    <PostCard
                      title={post.title}
                      excerpt={post.excerpt}
                      publishedAt={post.publishedAt}
                      type={post.type as "POST" | "PAGE" | "NEWS"}
                      slug={post.slug}
                      locale={post.locale}
                      isFeatured={post.isFeatured}
                      imageUrl={post.featuredMedia?.url ?? null}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 sm:left-2" />
              <CarouselNext className="right-2 sm:right-2" />
            </Carousel>
          </div>
        </section>
      )}

      {/* Pages */}
      {pages.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Resources</h2>
            <Link
              href="/pages"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              View all pages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/${page.locale}/pages/${page.slug}`}
                className="group block rounded-lg border bg-card p-4 sm:p-5 transition-colors hover:bg-muted/50"
              >
                <FileText className="h-5 w-5 mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                <h3 className="font-medium truncate group-hover:text-primary transition-colors text-sm sm:text-base" title={page.title}>
                  {page.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Join the Mission</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Help ensure the Zolai language thrives in the AI era. Contribute to the dataset, use the tutor, and track model training.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button asChild>
            <Link href="/signup">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/about">About the Project</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {SITE_CONSTANTS.name}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
