import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { FileText, Newspaper, Star, Lock } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PostType } from "@/features/content/schemas";
import { publicPostPath } from "@/lib/content-paths";

export interface PostCardProps {
  title: string;
  excerpt?: string | null;
  publishedAt?: Date | null;
  type: PostType;
  slug: string;
  locale: string;
  isFeatured?: boolean;
  imageUrl?: string | null;
  isPrivate?: boolean;
}

const typeConfig: Record<PostType, { label: string; icon: typeof FileText }> = {
  POST: { label: "Post", icon: FileText },
  PAGE: { label: "Page", icon: FileText },
  NEWS: { label: "News", icon: Newspaper },
};

function getPostHref(type: PostType, slug: string, locale: string): string {
  return publicPostPath(type, slug, locale);
}

export function PostCard({
  title,
  excerpt,
  publishedAt,
  type,
  slug,
  locale,
  isFeatured = false,
  imageUrl,
  isPrivate = false,
}: PostCardProps) {
  const config = typeConfig[type];
  const href = getPostHref(type, slug, locale);
  const Icon = config.icon;

  return (
    <Card className="transition-shadow hover:shadow-md h-full flex flex-col">
      <Link href={href} className="block">
        <div className="relative aspect-video w-full bg-gradient-to-br from-muted/80 to-muted/40">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              loading="lazy"
              unoptimized={imageUrl.startsWith("http")}
            />
          ) : (
            <div className="flex flex-col h-full w-full items-center justify-center gap-2 text-muted-foreground/60">
              <Icon className="size-12" />
              <span className="text-xs font-medium uppercase tracking-wider">{config.label}</span>
            </div>
          )}
          {isFeatured && (
            <Badge variant="default" className="absolute top-2 right-2 gap-1">
              <Star className="size-3" />
              Featured
            </Badge>
          )}
          {isPrivate && (
            <Badge variant="secondary" className="absolute top-2 left-2 gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
              <Lock className="size-3" />
              Members Only
            </Badge>
          )}
        </div>
      </Link>
      <CardHeader className="gap-2 pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs shrink-0">
            {config.label}
          </Badge>
          {publishedAt && (
            <CardDescription className="text-xs shrink-0">
              {format(publishedAt, "MMM d, yyyy")}
            </CardDescription>
          )}
        </div>
        <Link href={href} className="block">
          <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        {excerpt ? (
          <CardDescription className="line-clamp-3">
            {excerpt}
          </CardDescription>
        ) : (
          <div className="min-h-[4.5rem]" />
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={href} className="text-sm text-primary hover:underline flex items-center gap-1">
          {isPrivate ? <><Lock className="size-3" /> Sign in to read</> : "Read more →"}
        </Link>
      </CardFooter>
    </Card>
  );
}
