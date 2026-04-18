"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { client } from "@/lib/api/client";

export function EditPostPage({ id }: { id: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", type: "POST", status: "DRAFT", contentHtml: "", excerpt: "" });

  useEffect(() => {
    client.api.admin.posts.$get({ query: { q: id, limit: "1" } })
      .then(r => r.json())
      .then(d => {
        const p = (d as { data?: { title: string; slug: string; type: string; status: string; contentHtml?: string; excerpt?: string }[] }).data?.[0];
        if (p) setForm({ title: p.title, slug: p.slug, type: p.type, status: p.status, contentHtml: p.contentHtml ?? "", excerpt: p.excerpt ?? "" });
      });
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      const res = await client.api.admin.posts[":id"].$patch({ param: { id }, json: { title: form.title, status: form.status } });
      if (!res.ok) throw new Error((await res.json() as { error?: { message?: string } }).error?.message || "Failed");
      toast.success("Post updated");
      router.push("/admin/posts");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  }

  async function del() {
    if (!confirm("Delete this post?")) return;
    setDeleting(true);
    try {
      await client.api.admin.posts[":id"].$delete({ param: { id } });
      toast.success("Post deleted");
      router.push("/admin/posts");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Post</h1>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={del} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</Button>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <Input value={form.title} onChange={e => set("title", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Slug</label>
            <Input value={form.slug} disabled className="font-mono text-sm opacity-60" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Type</label>
            <Input value={form.type} disabled className="opacity-60" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm bg-background">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="PENDING">Pending</option>
              <option value="TRASH">Trash</option>
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Content (HTML)</label>
          <Textarea value={form.contentHtml} onChange={e => set("contentHtml", e.target.value)} rows={12} className="font-mono text-sm" />
        </div>
      </div>
    </div>
  );
}
