"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { client } from "@/lib/api/client";

export default function NewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", type: "POST", status: "DRAFT", contentHtml: "", excerpt: "" });

  async function save() {
    if (!form.title || !form.slug) { toast.error("Title and slug required"); return; }
    setSaving(true);
    try {
      const res = await client.api.content.posts.$post({ json: { ...form, contentRaw: form.contentHtml } });
      if (!res.ok) throw new Error((await res.json() as { error?: { message?: string } }).error?.message || "Failed");
      toast.success("Post created");
      router.push("/admin/posts");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally { setSaving(false); }
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Post</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Create"}</Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Title *</label>
            <Input value={form.title} onChange={e => {
              set("title", e.target.value);
              if (!form.slug) set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
            }} placeholder="Post title" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Slug *</label>
            <Input value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="url-slug" className="font-mono text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Type</label>
            <select value={form.type} onChange={e => set("type", e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm bg-background">
              <option value="POST">Post</option>
              <option value="PAGE">Page</option>
              <option value="NEWS">News</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm bg-background">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="PENDING">Pending Review</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Excerpt</label>
          <Input value={form.excerpt} onChange={e => set("excerpt", e.target.value)} placeholder="Short description" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Content (HTML)</label>
          <Textarea value={form.contentHtml} onChange={e => set("contentHtml", e.target.value)}
            placeholder="<p>Content here…</p>" rows={12} className="font-mono text-sm" />
        </div>
      </div>
    </div>
  );
}
