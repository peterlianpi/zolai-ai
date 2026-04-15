"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePickerTime } from "@/components/ui/date-picker";
import { useSiteSettings } from "@/features/settings/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ImagePlus, X } from "lucide-react";
import Link from "next/link";
import { useMediaById } from "@/features/media/hooks";
import MediaBrowser from "@/features/content/components/media-browser";
import { RichTextEditor } from "@/features/content/components/rich-text-editor";
import { ContentTaxonomyFields } from "@/features/content/components/content-taxonomy-fields";
import { TemplateSelector } from "@/features/templates/components/TemplateSelector";
import { Separator } from "@/components/ui/separator";

const contentFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  slug: z.string().min(1, "Slug is required").max(500),
  contentHtml: z.string(),
  excerpt: z.string().max(1000).optional().nullable(),
  type: z.enum(["POST", "PAGE", "NEWS"]),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED", "TRASH"]),
  locale: z.string().min(2),
  isFeatured: z.boolean(),
  isPopular: z.boolean(),
  publishedAt: z.date().optional().nullable(),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  seoKeywords: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  meta: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .default([]),
  featuredMediaId: z.string().nullable(),
  templateId: z.string().nullable().optional(),
  /** Term IDs (categories + tags) — same shape as API `terms`. */
  termIds: z.array(z.string().min(1)),
});

export type ContentFormValues = z.infer<typeof contentFormSchema>;

export interface ContentEditorProps {
  defaultValues?: Partial<ContentFormValues>;
  onSubmit: (values: ContentFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  className?: string;
  /** Back link for Cancel (WordPress-style). Defaults to the resources list. */
  cancelHref?: string;
  /** Rich text area minimum height (px). Passed to `RichTextEditor`. */
  editorMinHeightPx?: number;
  /** Rich text area maximum height (px). Passed to `RichTextEditor`. */
  editorMaxHeightPx?: number;
  /** Allow dragging the corner to resize the editor height. Default true. */
  editorResizable?: boolean;
}

function statusBadgeVariant(
  s: ContentFormValues["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (s) {
    case "PUBLISHED":
      return "default";
    case "PENDING":
      return "secondary";
    case "TRASH":
      return "destructive";
    default:
      return "outline";
  }
}

function statusLabel(s: ContentFormValues["status"]): string {
  switch (s) {
    case "DRAFT":
      return "Draft";
    case "PENDING":
      return "Pending review";
    case "PUBLISHED":
      return "Published";
    case "TRASH":
      return "Trash";
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatTimezoneLabel(timeZone: string, date: Date) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    const offset = parts.find((part) => part.type === "timeZoneName")?.value;
    return offset ? `${timeZone} (${offset})` : timeZone;
  } catch {
    return timeZone;
  }
}

export function ContentEditor({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  className,
  cancelHref = "/admin/content/resources",
  editorMinHeightPx,
  editorMaxHeightPx,
  editorResizable,
}: ContentEditorProps) {
   const form = useForm<ContentFormValues>({
     resolver: zodResolver(contentFormSchema) as Resolver<ContentFormValues>,
      defaultValues: {
        title: "",
        slug: "",
        contentHtml: "",
        excerpt: null,
        type: "POST" as const,
        status: "DRAFT" as const,
        locale: "en",
        isFeatured: false,
        isPopular: false,
        publishedAt: null,
        seoTitle: null,
        seoDescription: null,
        seoKeywords: null,
        canonicalUrl: null,
        meta: [],
        featuredMediaId: null,
        templateId: null,
        termIds: [],
        ...defaultValues,
      },
   });

   const title = useWatch({ control: form.control, name: "title" }) as string;
   const postType = useWatch({ control: form.control, name: "type" }) as ContentFormValues["type"];
   const status = useWatch({ control: form.control, name: "status" }) as ContentFormValues["status"];
   const prevPostTypeRef = useRef<ContentFormValues["type"] | undefined>(undefined);
   const featuredMediaId = useWatch({ control: form.control, name: "featuredMediaId" }) as string | null;
   const [selectedFeaturedImage, setSelectedFeaturedImage] = useState<{ id: string; url: string; altText: string | null } | null>(null);
   const [browserOpen, setBrowserOpen] = useState(false);
   const { data: loadedFeaturedMedia } = useMediaById(featuredMediaId);
   const featuredImage = selectedFeaturedImage ?? loadedFeaturedMedia ?? null;
   const metaFields = useFieldArray({
     control: form.control,
     name: "meta",
   });
   const { data: siteSettings } = useSiteSettings(["site_timezone"]);
   const siteTimezone =
     siteSettings?.find((setting) => setting.key === "site_timezone")?.value ||
     Intl.DateTimeFormat().resolvedOptions().timeZone;

   useEffect(() => {
     if (!defaultValues?.slug && title) {
       form.setValue("slug", generateSlug(title), {
         shouldValidate: true,
         shouldDirty: false,
       });
     }
   }, [title, form, defaultValues?.slug]);

   useEffect(() => {
     if (
       prevPostTypeRef.current !== undefined &&
       prevPostTypeRef.current !== postType
     ) {
       form.setValue("termIds", [], { shouldDirty: true });
     }
     prevPostTypeRef.current = postType;
   }, [postType, form]);

   const handleSelectImage = (id: string, url: string, altText: string | null) => {
     setSelectedFeaturedImage({ id, url, altText });
     form.setValue("featuredMediaId", id);
     setBrowserOpen(false);
   };

   const handleRemoveImage = () => {
     setSelectedFeaturedImage(null);
     form.setValue("featuredMediaId", null);
   };

   const submitWithStatus = (next: ContentFormValues["status"]) => {
     form.setValue("status", next, { shouldDirty: true, shouldValidate: true });
     if (next === "PUBLISHED") {
       const currentPublish = form.getValues("publishedAt");
       if (!currentPublish) {
         form.setValue("publishedAt", new Date(), {
           shouldDirty: true,
           shouldValidate: false,
         });
       }
     }
     void form.handleSubmit(onSubmit)();
   };

   const handlePublishNow = () => {
     form.setValue("publishedAt", new Date(), {
       shouldDirty: true,
       shouldValidate: false,
     });
     submitWithStatus("PUBLISHED");
   };

   const publishButtonLabel =
     status === "PUBLISHED" ? "Update" : "Publish";

  return (
    <div className={cn("w-full space-y-6", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {defaultValues?.title ? "Edit resource" : "Create resource"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Use Save draft or Publish / Update. Pick post type, categories, tags, and layout in the sidebar (WordPress-style).
          </p>
        </div>
        <div className="flex flex-wrap shrink-0 items-center gap-2">
          {isSubmitting ? (
            <Button type="button" variant="outline" disabled>
              Cancel
            </Button>
          ) : (
            <Button type="button" variant="outline" asChild>
              <Link href={cancelHref}>Cancel</Link>
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={() => submitWithStatus("DRAFT")}
          >
            {isSubmitting ? "Saving…" : "Save draft"}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitWithStatus("PUBLISHED")}
          >
            {isSubmitting ? "Saving…" : publishButtonLabel}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form
          id="content-resource-form"
          className="space-y-8"
          onSubmit={(e) => e.preventDefault()}
        >
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => <input type="hidden" {...field} />}
          />
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6 min-w-0">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="url-friendly-slug" {...field} />
                      </FormControl>
                      <FormDescription>Generated from the title when empty.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contentHtml"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                        placeholder="Write the article body…"
                        aria-invalid={!!fieldState.error}
                        minHeightPx={editorMinHeightPx}
                        maxHeightPx={editorMaxHeightPx}
                        resizable={editorResizable}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Short summary for listings and SEO"
                        className="min-h-[100px] resize-y"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <aside className="space-y-6 xl:sticky xl:top-4 xl:self-start">
              <div className="rounded-xl border bg-card p-4 shadow-xs">
                <h3 className="text-sm font-medium mb-3">Featured image</h3>
                {featuredImage ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featuredImage.url}
                      alt={featuredImage.altText || "Featured"}
                      className="aspect-video w-full rounded-md border object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow hover:bg-destructive/90"
                      aria-label="Remove featured image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {featuredImage.altText ? (
                      <p className="mt-2 truncate text-xs text-muted-foreground" title={featuredImage.altText}>
                        {featuredImage.altText}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <Dialog open={browserOpen} onOpenChange={setBrowserOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <ImagePlus className="mb-2 h-8 w-8" />
                        <span className="text-sm">Choose from media library</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Select featured image</DialogTitle>
                      </DialogHeader>
                      <MediaBrowser
                        onSelect={handleSelectImage}
                        selectedId={featuredMediaId}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
                <div>
                  <h3 className="text-sm font-medium">Categories & tags</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
                    Posts use blog categories and tags; news uses news categories and news tags; pages skip taxonomies.
                  </p>
                </div>
                <Separator />
                <FormField
                  control={form.control}
                  name="termIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ContentTaxonomyFields
                          postType={postType}
                          value={field.value ?? []}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-xl border bg-card p-4 shadow-xs space-y-4">
                <h3 className="text-sm font-medium">Publishing</h3>
                <Separator />
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <Badge variant={statusBadgeVariant(status)} className="text-xs">
                    {statusLabel(status)}
                  </Badge>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Changes when you use Save draft (draft) or Publish / Update (live).
                  </p>
                </div>
                <Separator />
                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish date</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <DatePickerTime
                            value={field.value ?? undefined}
                            onChange={(date) => field.onChange(date ?? null)}
                          />
                          {field.value && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => field.onChange(null)}
                            >
                              Clear date
                            </Button>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={handlePublishNow}
                            >
                              Publish now
                            </Button>
                            <span className="text-xs text-muted-foreground" title={siteTimezone}>
                              Timezone: {formatTimezoneLabel(siteTimezone, new Date())}
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Schedule a future publish time or leave blank for immediate publish.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Post type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="POST">Post</SelectItem>
                          <SelectItem value="PAGE">Page</SelectItem>
                          <SelectItem value="NEWS">News</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Same idea as WordPress: post, page, or news — taxonomies match the type above.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locale</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Locale" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="my">Myanmar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <TemplateSelector
                  name="templateId"
                  label="Page Template"
                  description="Choose a layout template for this page"
                />
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">SEO</h3>
                  <FormField
                    control={form.control}
                    name="seoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Optional SEO title"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seoDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Optional SEO description"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="seoKeywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Keywords</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="keyword1, keyword2"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="canonicalUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canonical URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/post"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Overrides the default canonical link for this page.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Post Meta</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => metaFields.append({ key: "", value: "" })}
                    >
                      Add meta
                    </Button>
                  </div>
                  {metaFields.fields.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No meta fields yet. Add custom key/value pairs for integrations.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {metaFields.fields.map((field, index) => (
                        <div key={field.id} className="grid gap-2">
                          <div className="grid gap-2 md:grid-cols-[1fr_1.5fr_auto]">
                            <FormField
                              control={form.control}
                              name={`meta.${index}.key` as const}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="meta_key" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`meta.${index}.value` as const}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Meta value" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => metaFields.remove(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-4 shadow-xs">
                <h3 className="text-sm font-medium mb-3">Highlights</h3>
                <div className="flex flex-col gap-3">
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Featured</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isPopular"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">Popular</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </aside>
          </div>
        </form>
      </Form>
    </div>
  );
}
