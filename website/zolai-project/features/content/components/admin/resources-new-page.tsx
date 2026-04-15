"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ContentEditor } from "@/features/content/components/content-editor";
import type { ContentFormValues } from "@/features/content/components/content-editor";
import { client } from "@/lib/api/client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { adminResourcesPath } from "@/lib/content-paths";

export default function ResourcesNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const typeParam = searchParams.get("type");
  const normalizedType =
    typeParam === "POST" || typeParam === "NEWS" || typeParam === "PAGE"
      ? typeParam
      : "POST";
  const localeParam = searchParams.get("locale");
  const normalizedLocale = localeParam === "my" ? "my" : "en";
  const backHref =
    typeParam === "POST" || typeParam === "NEWS" || typeParam === "PAGE"
      ? adminResourcesPath(typeParam, normalizedLocale)
      : "/admin/content/resources";
  const titleLabel =
    normalizedType === "POST"
      ? "New Post"
      : normalizedType === "NEWS"
        ? "New Article"
        : "New Page";

  const handleSubmit = async (values: ContentFormValues) => {
    setIsSubmitting(true);
    try {
      const { termIds, ...rest } = values;
      const res = await client.api.content.posts.$post({
        json: {
          ...rest,
          featuredMediaId: values.featuredMediaId || null,
          templateId: values.templateId || null,
          terms: termIds,
        },
      });

      if (!res.ok) {
        const data = await res.json() as { error?: { message: string } };
        throw new Error(data.error?.message || "Failed to create resource");
      }

      toast.success(
        values.status === "PUBLISHED"
          ? "Resource published."
          : "Draft saved.",
      );
      router.push(backHref);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center gap-4">
      <Link href={backHref}>
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <h1 className="text-2xl font-bold">{titleLabel}</h1>
    </div>
      <ContentEditor
        defaultValues={{
          type: normalizedType,
          locale: normalizedLocale,
          status: "DRAFT",
          termIds: [],
        }}
        cancelHref={backHref}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
  </div>
);
}
