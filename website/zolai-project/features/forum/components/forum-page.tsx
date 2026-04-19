"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Eye, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string; slug: string; title: string; description: string;
  category: string; tags: string[]; viewCount: number; answerCount: number;
  createdAt: string; author: { name: string };
}

const SORTS = ["latest", "top", "answered"] as const;
const PAGE_SIZE = 10;

export function ForumPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<typeof SORTS[number]>("latest");
  const [search, setSearch] = useState("");
  const [dSearch, setDSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general" });
  const qc = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => { setDSearch(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isFetching } = useQuery({
    queryKey: ["forum-posts", sort, dSearch, page],
    queryFn: async () => {
      const res = await client.api.forum.posts.$get({
        query: { sort, page: String(page), limit: String(PAGE_SIZE), ...(dSearch && { search: dSearch }) },
      });
      return res.json();
    },
  });

  const posts: Post[] = (data as { data?: Post[] })?.data ?? [];
  const total: number = (data as { meta?: { total: number } })?.meta?.total ?? 0;

  async function submit() {
    if (!form.title || !form.content) return;
    const res = await client.api.forum.posts.$post({ json: form });
    const json = await res.json();
    if ((json as { success?: boolean }).success) {
      toast.success("Post created!");
      setOpen(false);
      setForm({ title: "", content: "", category: "general" });
      qc.invalidateQueries({ queryKey: ["forum-posts"] });
    } else {
      toast.error("Failed to create post");
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Community Forum</h1>
          <p className="text-sm text-muted-foreground">{total} discussions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />New Post</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Discussion</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Your question or topic…" />
              </div>
              <div className="space-y-1">
                <Label>Content</Label>
                <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Describe your question…" className="min-h-[120px]" />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="general, grammar, vocabulary…" />
              </div>
              <Button onClick={submit} className="w-full">Post</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search discussions…" className="pl-9" />
        </div>
        <div className="flex gap-1">
          {SORTS.map(s => (
            <Button key={s} size="sm" variant={sort === s ? "default" : "outline"} onClick={() => { setSort(s); setPage(1); }} className="capitalize">{s}</Button>
          ))}
        </div>
      </div>

      {isFetching ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground">No posts yet. Start the first discussion!</p>
      ) : (
        <div className="space-y-3">
          {posts.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{p.title}</CardTitle>
                  {p.category && <Badge variant="outline" className="shrink-0 capitalize text-xs">{p.category}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{p.author?.name}</span>
                  <span>{formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.viewCount}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{p.answerCount}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground self-center">Page {page} of {Math.ceil(total / PAGE_SIZE)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / PAGE_SIZE)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
