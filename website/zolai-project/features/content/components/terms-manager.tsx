"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCreateTerm, useDeleteTerm, useTermsList, useTaxonomies, useUpdateTerm } from "@/features/content/hooks";
import type { Taxonomy, Term } from "@/features/content/types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const TAXONOMY_LABELS: Record<string, string> = {
  category: "Post categories",
  post_tag: "Post tags",
  news_category: "News categories",
  news_tag: "News tags",
};

function taxonomyLabel(taxonomy?: Taxonomy) {
  if (!taxonomy) return "Terms";
  return TAXONOMY_LABELS[taxonomy.slug] ?? taxonomy.name;
}

export default function TermsManager() {
  const { data: taxonomies = [], isLoading: loadingTaxonomies } = useTaxonomies();
  const [taxonomyId, setTaxonomyId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Term | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Term | null>(null);

  const createTerm = useCreateTerm();
  const updateTerm = useUpdateTerm();
  const deleteTerm = useDeleteTerm();

  const selectedTaxonomy = useMemo(
    () => taxonomies.find((t) => t.id === taxonomyId) ?? taxonomies[0],
    [taxonomies, taxonomyId],
  );

  const list = useTermsList({
    taxonomyId: selectedTaxonomy?.id,
    page,
    limit: 20,
  });

  const terms = list.data?.terms ?? [];
  const meta = list.data?.meta;

  const label = taxonomyLabel(selectedTaxonomy);

  const duplicateCheck = (nextName: string, nextSlug: string) => {
    const s = nextSlug.trim().toLowerCase();
    const n = nextName.trim().toLowerCase();
    return terms.some(
      (t) => t.slug.toLowerCase() === s || t.name.toLowerCase() === n,
    );
  };

  const handleCreate = async () => {
    if (!selectedTaxonomy) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const finalSlug = slug.trim() ? slugify(slug) : slugify(trimmed);
    if (!finalSlug) return;
    if (duplicateCheck(trimmed, finalSlug)) {
      setFormError("That name or slug already exists.");
      return;
    }
    try {
      await createTerm.mutateAsync({
        taxonomyId: selectedTaxonomy.id,
        name: trimmed,
        slug: finalSlug,
        description: description.trim() || null,
      });
      setName("");
      setSlug("");
      setDescription("");
      setFormError(null);
    } catch {
      setFormError("Failed to create. Please try again.");
    }
  };

  const openEdit = (term: Term) => {
    setEditing(term);
    setEditName(term.name);
    setEditSlug(term.slug);
    setEditDescription(term.description ?? "");
    setEditError(null);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    const trimmed = editName.trim();
    if (!trimmed) return;
    const finalSlug = editSlug.trim() ? slugify(editSlug) : slugify(trimmed);
    if (!finalSlug) return;

    const hasDuplicate = terms.some(
      (t) =>
        t.id !== editing.id &&
        (t.slug.toLowerCase() === finalSlug.toLowerCase() ||
          t.name.toLowerCase() === trimmed.toLowerCase()),
    );
    if (hasDuplicate) {
      setEditError("That name or slug already exists.");
      return;
    }

    try {
      await updateTerm.mutateAsync({
        id: editing.id,
        data: {
          name: trimmed,
          slug: finalSlug,
          description: editDescription.trim() || null,
        },
      });
      setEditing(null);
      setEditError(null);
    } catch {
      setEditError("Failed to update. Please try again.");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-0">
      <Card>
        <CardHeader>
          <CardTitle>Manage categories & tags</CardTitle>
          <CardDescription>
            Create, edit, and delete terms for posts and news. Use categories for
            broad groups and tags for specific topics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Taxonomy</Label>
            <Select
              value={selectedTaxonomy?.id}
              onValueChange={(value) => {
                setTaxonomyId(value);
                setPage(1);
              }}
              disabled={loadingTaxonomies}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select taxonomy" />
              </SelectTrigger>
              <SelectContent>
                {taxonomies.map((tax) => (
                  <SelectItem key={tax.id} value={tax.id}>
                    {taxonomyLabel(tax)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>New {label}</Label>
            <div className="grid gap-2 md:grid-cols-3">
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError(null);
                }}
              />
              <Input
                placeholder="Slug (optional)"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setFormError(null);
                }}
              />
              <Input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {formError && <p className="text-xs text-destructive">{formError}</p>}
            <div>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={
                  !selectedTaxonomy?.id ||
                  createTerm.isPending ||
                  !name.trim()
                }
              >
                Add term
              </Button>
            </div>
          </div>
          <div className="rounded-md border bg-muted/20 p-4">
            <p className="text-sm font-medium">Recommendations</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>Use categories for broad groups, tags for specific topics.</li>
              <li>Keep names short and consistent; avoid duplicates.</li>
              <li>Slugs should be lowercase and hyphenated.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{label}</CardTitle>
          <CardDescription>
            Keep names short, avoid duplicates, and prefer tags for specific
            topics. Use consistent slug formatting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {list.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading terms...</p>
          ) : terms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No terms yet.</p>
          ) : (
            <div className="space-y-3">
              {terms.map((term) => (
                <div key={term.id} className="flex items-center justify-between gap-4 rounded-md border p-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{term.name}</p>
                    <p className="text-xs text-muted-foreground truncate">/{term.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(term)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(term)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit term</DialogTitle>
            <DialogDescription>Update name or slug for this term.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                setEditError(null);
              }}
              placeholder="Name"
            />
            <Input
              value={editSlug}
              onChange={(e) => {
                setEditSlug(e.target.value);
                setEditError(null);
              }}
              placeholder="Slug"
            />
            <Input
              value={editDescription}
              onChange={(e) => {
                setEditDescription(e.target.value);
                setEditError(null);
              }}
              placeholder="Description"
            />
          </div>
          {editError && <p className="text-xs text-destructive">{editError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateTerm.isPending || !editName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete term"
        description="Are you sure you want to delete this term? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteTerm.isPending}
        onConfirm={() =>
          deleteTarget &&
          deleteTerm.mutate(
            { id: deleteTarget.id, taxonomyId: selectedTaxonomy?.id },
            { onSuccess: () => setDeleteTarget(null) },
          )
        }
      />
    </div>
  );
}
