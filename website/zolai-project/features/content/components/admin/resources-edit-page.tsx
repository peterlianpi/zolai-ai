"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ContentEditor } from "@/features/content/components/content-editor";
import type { ContentFormValues } from "@/features/content/components/content-editor";
import { client } from "@/lib/api/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { adminResourcesPath } from "@/lib/content-paths";

interface PostApiData {
  title: string;
  slug: string;
  contentHtml: string | null;
  excerpt: string | null;
  type: "POST" | "PAGE" | "NEWS";
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "TRASH";
  locale: string;
  isFeatured: boolean;
  isPopular: boolean;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
  featuredMediaId: string | null;
  template: "default" | "full-width" | "sidebar" | "centered" | "blank" | string | null;
  templateId?: string | null;
  terms?: { termId: string }[];
  meta?: { key: string; value: string }[];
}

export default function ResourcesEditPage({ id }: { id: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState<ContentFormValues | null>(null);
  const [loading, setLoading] = useState(true);

  const isServiceUnavailableError = (value: unknown): boolean => {
    if (!value || typeof value !== "object") return false;
    const status = (value as { status?: number }).status;
    return status === 503;
  };

  const backHref =
    post?.type === "POST" || post?.type === "NEWS" || post?.type === "PAGE"
      ? adminResourcesPath(post.type, post.locale)
      : "/admin/content/resources";

  const titleLabel =
    post?.type === "POST"
      ? "Edit Post"
      : post?.type === "NEWS"
        ? "Edit Article"
        : post?.type === "PAGE"
          ? "Edit Page"
          : "Edit Resource";

  useEffect(() => {
    async function fetchPost() {
      try {
        let res = await client.api.content.posts[":id"].$get({ param: { id } });

        // The API can briefly return 503 while circuit-breaker opens/closes under DB pressure.
        // Retry once after a short delay before surfacing an error to the user.
        if (res.status === 503) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          res = await client.api.content.posts[":id"].$get({ param: { id } });
        }

        const json = await res.json() as { success?: boolean; data?: PostApiData };

        if (!json.success || !json.data) {
          toast.error("Resource not found");
          router.push("/admin/content/resources");
          return;
        }

        const p = json.data;
        setPost({
          title: p.title,
          slug: p.slug,
          contentHtml: p.contentHtml || "",
          excerpt: p.excerpt || null,
          type: p.type,
          status: p.status,
          locale: p.locale,
          isFeatured: p.isFeatured,
          isPopular: p.isPopular,
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
          seoTitle: p.seoTitle ?? null,
          seoDescription: p.seoDescription ?? null,
          seoKeywords: p.seoKeywords ?? null,
          canonicalUrl: p.canonicalUrl ?? null,
          meta: p.meta?.map((item) => ({ key: item.key, value: item.value })) ?? [],
          featuredMediaId: p.featuredMediaId || null,
          templateId: p.templateId || null,
          termIds: p.terms?.map((t) => t.termId) ?? [],
        });
      } catch {
        toast.error("Temporary database timeout while loading. Please retry.");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id, router]);

  const handleSubmit = async (values: ContentFormValues) => {
    setIsSubmitting(true);
    try {
       const { termIds, ...rest } = values;
       const res = await client.api.content.posts[":id"].$patch({
         param: { id },
         json: {
            ...rest,
            featuredMediaId: values.featuredMediaId || null,
            templateId: values.templateId || null,
            terms: termIds,
          },
        });

      if (!res.ok) {
        const data = await res.json() as { error?: { message: string } };
        const message = data.error?.message || "Failed to update resource";
        if (res.status === 503) {
          throw Object.assign(new Error(message), { status: 503 });
        }
        throw new Error(message);
      }

      toast.success(
        values.status === "PUBLISHED"
          ? "Changes published."
          : "Draft saved.",
      );
      router.push(backHref);
    } catch (error) {
      if (isServiceUnavailableError(error)) {
        toast.error("Temporary database timeout while saving. Please retry.");
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to update resource");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
        <p className="text-sm text-muted-foreground">
          Resource could not be loaded right now. The database may be temporarily unavailable.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            onClick={() => {
              setLoading(true);
              void (async () => {
                try {
                  const res = await client.api.content.posts[":id"].$get({ param: { id } });
                  const json = await res.json() as { success?: boolean; data?: PostApiData };
                  if (json.success && json.data) {
                    const p = json.data;
                    setPost({
                      title: p.title,
                      slug: p.slug,
                      contentHtml: p.contentHtml || "",
                      excerpt: p.excerpt || null,
                      type: p.type,
                      status: p.status,
                      locale: p.locale,
                      isFeatured: p.isFeatured,
                      isPopular: p.isPopular,
                      publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
                      seoTitle: p.seoTitle ?? null,
                      seoDescription: p.seoDescription ?? null,
                      seoKeywords: p.seoKeywords ?? null,
                      canonicalUrl: p.canonicalUrl ?? null,
                      meta: p.meta?.map((item) => ({ key: item.key, value: item.value })) ?? [],
                      featuredMediaId: p.featuredMediaId || null,
                      templateId: p.templateId || null,
                      termIds: p.terms?.map((t) => t.termId) ?? [],
                    });
                  }
                } finally {
                  setLoading(false);
                }
              })();
            }}
          >
            Retry
          </button>
          <Link href="/admin/content/resources" className="text-sm underline">
            Back to resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <Link href={backHref}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">{titleLabel}</h1>
      </div>
      {post && (
        <ContentEditor
          defaultValues={post}
          cancelHref={backHref}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
