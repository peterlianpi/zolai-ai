"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { client } from "@/lib/api/client";

export function EditWikiPage({ id }: { id: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", status: "published", content: "" });

  useEffect(() => {
    client.api.zolai.wiki[":slug"].$get({ param: { slug: id } })
      .then(async r => r.json() as unknown as { data?: { title: string; category: string; status: string; content: string } })
      .then(d => {
        if (d.data) setForm({ title: d.data.title, category: d.data.category, status: d.data.status, content: d.data.content });
      });
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      const res = await client.api.admin.wiki[":id"].$patch({ param: { id }, json: form });
      if (!res.ok) throw new Error((await res.json() as { error?: { message?: string } }).error?.message || "Failed");
      toast.success("Wiki entry updated");
      router.push("/admin/wiki");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Error"); }
    finally { setSaving(false); }
  }

  async function del() {
    if (!confirm("Delete this wiki entry?")) return;
    try {
      await client.api.admin.wiki[":id"].$delete({ param: { id } });
      toast.success("Deleted");
      router.push("/admin/wiki");
    } catch { toast.error("Delete failed"); }
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Wiki Entry</h1>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={del}>Delete</Button>
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
            <label className="text-sm font-medium">Category</label>
            <Input value={form.category} onChange={e => set("category", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Status</label>
          <select value={form.status} onChange={e => set("status", e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm bg-background">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Content (Markdown)</label>
          <Textarea value={form.content} onChange={e => set("content", e.target.value)} rows={20} className="font-mono text-sm" />
        </div>
      </div>
    </div>
  );
}
