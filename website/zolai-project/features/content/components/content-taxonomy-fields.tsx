"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Term } from "@/features/content/types";
import { useCreateTerm, useTaxonomies, useTerms } from "@/features/content/hooks";

type PostType = "POST" | "PAGE" | "NEWS";


interface ContentTaxonomyFieldsProps {
  postType: PostType;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

function taxonomySlugsForPostType(
  type: PostType,
): { categorySlug: string | null; tagSlug: string | null } {
  switch (type) {
    case "POST":
      return { categorySlug: "category", tagSlug: "post_tag" };
    case "NEWS":
      return { categorySlug: "news_category", tagSlug: "news_tag" };
    case "PAGE":
      return { categorySlug: null, tagSlug: null };
    default:
      return { categorySlug: null, tagSlug: null };
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}


function toggleId(ids: string[], id: string, checked: boolean): string[] {
  if (checked) return ids.includes(id) ? ids : [...ids, id];
  return ids.filter((x) => x !== id);
}

function TermCheckboxList({
  label,
  terms,
  selectedIds,
  onToggle,
  disabled,
  searchPlaceholder,
}: {
  label: string;
  terms: Term[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
  disabled?: boolean;
  searchPlaceholder: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return terms;
    return terms.filter(
      (t) =>
        t.name.toLowerCase().includes(s) || t.slug.toLowerCase().includes(s),
    );
  }, [terms, q]);

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Input
        placeholder={searchPlaceholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        disabled={disabled}
        className="h-8 text-sm"
      />
      <ScrollArea className="h-[min(200px,28vh)] rounded-md border bg-muted/10 pr-2">
        <div className="space-y-2 p-2">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">No matches.</p>
          ) : (
            filtered.map((t) => (
              <div
                key={t.id}
                className="flex items-start gap-2 rounded-sm hover:bg-muted/40 px-1 py-0.5"
              >
                <Checkbox
                  id={`term-${t.id}`}
                  checked={selectedIds.includes(t.id)}
                  onCheckedChange={(c) => onToggle(t.id, c === true)}
                  disabled={disabled}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`term-${t.id}`}
                  className="text-sm leading-tight cursor-pointer flex-1"
                >
                  {t.name}
                </label>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function ContentTaxonomyFields({
  postType,
  value,
  onChange,
  disabled,
}: ContentTaxonomyFieldsProps) {
  const { categorySlug, tagSlug } = taxonomySlugsForPostType(postType);
  const { data: taxonomies = [], isLoading: isTaxLoading } = useTaxonomies();
  const createTerm = useCreateTerm();

  const categoryTaxonomy = useMemo(
    () => taxonomies.find((t) => t.slug === categorySlug),
    [taxonomies, categorySlug],
  );
  const tagTaxonomy = useMemo(
    () => taxonomies.find((t) => t.slug === tagSlug),
    [taxonomies, tagSlug],
  );

  const { data: categoryTermsData, isLoading: isCategoryLoading } = useTerms(
    categoryTaxonomy?.id,
  );
  const { data: tagTermsData, isLoading: isTagLoading } = useTerms(
    tagTaxonomy?.id,
  );

  const categoryTerms = useMemo(
    () =>
      (categoryTermsData?.terms ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
    [categoryTermsData],
  );
  const tagTerms = useMemo(
    () =>
      (tagTermsData?.terms ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
    [tagTermsData],
  );

  const loading = isTaxLoading || isCategoryLoading || isTagLoading;

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagSlug, setNewTagSlug] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);

  const hasDuplicate = (terms: Term[], slug: string, name: string) => {
    const s = slug.trim().toLowerCase();
    const n = name.trim().toLowerCase();
    return terms.some(
      (t) => t.slug.toLowerCase() === s || t.name.toLowerCase() === n,
    );
  };

  const handleCreate = async (
    taxonomyId: string | undefined,
    name: string,
    slugInput: string,
    existingTerms: Term[],
    onReset: () => void,
    onError: (message: string | null) => void,
  ) => {
    if (!taxonomyId) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const slug = slugInput.trim() ? slugify(slugInput) : slugify(trimmed);
    if (!slug) return;
    if (hasDuplicate(existingTerms, slug, trimmed)) {
      onError("That name or slug already exists.");
      return;
    }
    try {
      const term = await createTerm.mutateAsync({
        taxonomyId,
        name: trimmed,
        slug,
      });
      onChange(toggleId(value, term.id, true));
      onReset();
      onError(null);
    } catch {
      onError("Failed to create. Please try again.");
    }
  };

  if (postType === "PAGE") {
    return (
      <p className="text-xs text-muted-foreground leading-relaxed">
        Pages do not use categories or tags. Use the post type <strong>Post</strong> or{" "}
        <strong>News</strong> to classify content.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[120px] w-full" />
      </div>
    );
  }

  const onToggle = (id: string, checked: boolean) => {
    onChange(toggleId(value, id, checked));
  };

  return (
    <div className={cn("space-y-5", disabled && "opacity-60")}>
      <TermCheckboxList
        label={postType === "NEWS" ? "News categories" : "Categories"}
        terms={categoryTerms}
        selectedIds={value}
        onToggle={onToggle}
        disabled={disabled}
        searchPlaceholder="Search categories…"
      />
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add new category"
            value={newCategoryName}
            onChange={(e) => {
              setNewCategoryName(e.target.value);
              setCategoryError(null);
            }}
            disabled={disabled || createTerm.isPending}
            className="h-9"
          />
          <Input
            placeholder="Slug (optional)"
            value={newCategorySlug}
            onChange={(e) => {
              setNewCategorySlug(e.target.value);
              setCategoryError(null);
            }}
            disabled={disabled || createTerm.isPending}
            className="h-9"
          />
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50"
            onClick={() =>
              handleCreate(
                categoryTaxonomy?.id,
                newCategoryName,
                newCategorySlug,
                categoryTerms,
                () => {
                  setNewCategoryName("");
                  setNewCategorySlug("");
                },
                setCategoryError,
              )
            }
            disabled={
              disabled ||
              createTerm.isPending ||
              !categoryTaxonomy?.id ||
              !newCategoryName.trim()
            }
          >
            Add
          </button>
        </div>
        {categoryError && (
          <p className="text-xs text-destructive">{categoryError}</p>
        )}
      </div>
      <TermCheckboxList
        label={postType === "NEWS" ? "News tags" : "Tags"}
        terms={tagTerms}
        selectedIds={value}
        onToggle={onToggle}
        disabled={disabled}
        searchPlaceholder="Search tags…"
      />
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add new tag"
            value={newTagName}
            onChange={(e) => {
              setNewTagName(e.target.value);
              setTagError(null);
            }}
            disabled={disabled || createTerm.isPending}
            className="h-9"
          />
          <Input
            placeholder="Slug (optional)"
            value={newTagSlug}
            onChange={(e) => {
              setNewTagSlug(e.target.value);
              setTagError(null);
            }}
            disabled={disabled || createTerm.isPending}
            className="h-9"
          />
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50"
            onClick={() =>
              handleCreate(
                tagTaxonomy?.id,
                newTagName,
                newTagSlug,
                tagTerms,
                () => {
                  setNewTagName("");
                  setNewTagSlug("");
                },
                setTagError,
              )
            }
            disabled={
              disabled ||
              createTerm.isPending ||
              !tagTaxonomy?.id ||
              !newTagName.trim()
            }
          >
            Add
          </button>
        </div>
        {tagError && <p className="text-xs text-destructive">{tagError}</p>}
      </div>
    </div>
  );
}
