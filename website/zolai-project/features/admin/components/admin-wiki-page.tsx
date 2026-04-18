"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { client } from "@/lib/api/client";

interface WikiEntry { id: string; slug: string; title: string; category: string; status: string; tags: string[]; updatedAt: string }

export function AdminWikiPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-wiki", search, category],
    queryFn: async () => {
      const res = await client.api.zolai.wiki.$get({
        query: { ...(search && { search }), ...(category !== "all" && { category }) },
      });
      return res.json() as unknown as { success: boolean; data: WikiEntry[] };
    },
  });

  const entries: WikiEntry[] = data?.data ?? [];
  const categories = [...new Set(entries.map(e => e.category))].sort();

  async function action(id: string, status: string) {
    try {
      const res = await client.api.admin.wiki[":id"].$patch({ param: { id }, json: { status } });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["admin-wiki"] });
      toast.success(`Entry ${status}`);
    } catch { toast.error("Action failed"); }
  }

  async function del(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await client.api.admin.wiki[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["admin-wiki"] });
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Wiki Entries</h1>
          <p className="text-sm text-muted-foreground">{entries.length} entries</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {["all", ...categories].map(c => (
              <Button key={c} size="sm" variant={category === c ? "default" : "outline"} onClick={() => setCategory(c)} className="capitalize h-8 text-xs">{c}</Button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 h-8" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5}><div className="h-8 bg-muted animate-pulse rounded" /></TableCell></TableRow>
              ))
            ) : entries.filter(e =>
              (!search || e.title.toLowerCase().includes(search.toLowerCase())) &&
              (category === "all" || e.category === category)
            ).map(e => (
              <TableRow key={e.id}>
                <TableCell className="font-medium text-sm">{e.title}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize text-xs">{e.category}</Badge></TableCell>
                <TableCell>
                  <Badge variant={e.status === "published" ? "default" : "secondary"} className="text-xs">{e.status}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(e.updatedAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {e.status === "published"
                        ? <DropdownMenuItem onClick={() => action(e.id, "draft")}>Unpublish</DropdownMenuItem>
                        : <DropdownMenuItem onClick={() => action(e.id, "published")}>Publish</DropdownMenuItem>
                      }
                      <DropdownMenuItem className="text-destructive" onClick={() => del(e.id, e.title)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
