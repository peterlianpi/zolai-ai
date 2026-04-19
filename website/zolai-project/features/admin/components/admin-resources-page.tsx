"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { client } from "@/lib/api/client";

interface Resource { id: string; slug: string; title: string; resourceType: string; difficultyLevel: string; status: string; viewCount: number; category: string | null; createdAt: string }



export function AdminResourcesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-resources", search, type, status, page],
    queryFn: async () => {
      const res = await client.api.admin.resources.$get({
        query: { page: String(page), limit: "20", ...(search && { q: search }), ...(type !== "all" && { type }), ...(status !== "all" && { status }) },
      });
      return res.json();
    },
  });

  const resources: Resource[] = data?.data ?? [];
  const meta = data?.meta;

  async function setResourceStatus(id: string, newStatus: string) {
    try {
      const res = await client.api.admin.resources[":id"].$patch({ param: { id }, json: { status: newStatus, ...(newStatus === "PUBLISHED" && { publishedAt: new Date().toISOString() }) } });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["admin-resources"] });
      toast.success(`Resource ${newStatus.toLowerCase()}`);
    } catch { toast.error("Action failed"); }
  }

  async function del(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await client.api.admin.resources[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["admin-resources"] });
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  }

  const STATUS_COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    PUBLISHED: "default", DRAFT: "secondary", REVIEW: "outline", ARCHIVED: "destructive",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Learning Resources</h1>
          <p className="text-sm text-muted-foreground">{meta?.total ?? 0} total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={type} onValueChange={v => { setType(v); setPage(1); }}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {["LESSON","VOCABULARY","GRAMMAR","EXERCISE","ARTICLE","STORY","QUIZ","REFERENCE"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={v => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="REVIEW">Review</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 w-48 h-8" />
          </div>
          <Button size="sm" className="h-8 gap-1" asChild>
            <Link href="/admin/content/resources/new"><Plus className="w-4 h-4" />New</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={7}><div className="h-8 bg-muted animate-pulse rounded" /></TableCell></TableRow>
            )) : resources.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No resources found</TableCell></TableRow>
            ) : resources.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-sm truncate max-w-[180px]">{r.title}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{r.resourceType}</Badge></TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{r.difficultyLevel}</Badge></TableCell>
                <TableCell><Badge variant={STATUS_COLORS[r.status]} className="text-xs">{r.status}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.viewCount}</TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link href={`/admin/content/resources/${r.id}/edit`}>Edit</Link></DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {r.status !== "PUBLISHED" && <DropdownMenuItem onClick={() => setResourceStatus(r.id, "PUBLISHED")}>Publish</DropdownMenuItem>}
                      {r.status !== "DRAFT" && <DropdownMenuItem onClick={() => setResourceStatus(r.id, "DRAFT")}>Unpublish</DropdownMenuItem>}
                      {r.status !== "ARCHIVED" && <DropdownMenuItem onClick={() => setResourceStatus(r.id, "ARCHIVED")} className="text-orange-600">Archive</DropdownMenuItem>}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => del(r.id, r.title)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{resources.length} of {meta.total}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-sm self-center">Page {page} of {meta.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
