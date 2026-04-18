"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, MoreHorizontal, Volume2 } from "lucide-react";
import { toast } from "sonner";

import { client } from "@/lib/api/client";

interface Word { id: string; zolai: string; english: string; pos: string | null; category: string | null; accuracy: string | null; audioUrl: string | null; definition: string | null }

export function AdminVocabPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [accuracy, setAccuracy] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Word | null>(null);
  const [editForm, setEditForm] = useState({ accuracy: "", audioUrl: "", definition: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-vocab", search, accuracy, page],
    queryFn: async () => {
      const res = await client.api.dictionary.search.$get({
        query: { q: search || " ", lang: "both", page: String(page), limit: "50" },
      });
      return res.json() as unknown as { success: boolean; data: Word[]; meta: { total: number; page: number; limit: number; totalPages: number } };
    },
  });

  const words: Word[] = data?.data ?? [];
  const meta = data?.meta;

  async function save() {
    if (!editing) return;
    try {
      const res = await client.api.admin.vocab[":id"].$patch({ param: { id: editing.id }, json: editForm });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["admin-vocab"] });
      toast.success("Updated");
      setEditing(null);
    } catch { toast.error("Update failed"); }
  }

  async function del(id: string, word: string) {
    if (!confirm(`Delete "${word}"?`)) return;
    try {
      const res = await client.api.admin.vocab[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["admin-vocab"] });
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  }

  async function confirm_(id: string) {
    try {
      const res = await client.api.admin.vocab[":id"].$patch({ param: { id }, json: { accuracy: "confirmed" } });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["admin-vocab"] });
      toast.success("Confirmed");
    } catch { toast.error("Failed"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Vocabulary</h1>
          <p className="text-sm text-muted-foreground">{meta?.total?.toLocaleString() ?? 0} words</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={accuracy} onValueChange={v => { setAccuracy(v); setPage(1); }}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accuracy</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 w-48 h-8" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zolai</TableHead>
              <TableHead>English</TableHead>
              <TableHead>POS</TableHead>
              <TableHead>Accuracy</TableHead>
              <TableHead>Audio</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={6}><div className="h-8 bg-muted animate-pulse rounded" /></TableCell></TableRow>
            )) : words.map(w => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.zolai}</TableCell>
                <TableCell className="text-muted-foreground">{w.english}</TableCell>
                <TableCell>{w.pos && <Badge variant="outline" className="text-xs">{w.pos}</Badge>}</TableCell>
                <TableCell>
                  <Badge variant={w.accuracy === "confirmed" ? "default" : "secondary"} className="text-xs">
                    {w.accuracy ?? "unverified"}
                  </Badge>
                </TableCell>
                <TableCell>{w.audioUrl ? <Volume2 className="w-4 h-4 text-green-500" /> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditing(w); setEditForm({ accuracy: w.accuracy ?? "unverified", audioUrl: w.audioUrl ?? "", definition: w.definition ?? "" }); }}>Edit</DropdownMenuItem>
                      {w.accuracy !== "confirmed" && <DropdownMenuItem onClick={() => confirm_(w.id)}>✓ Confirm</DropdownMenuItem>}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => del(w.id, w.zolai)}>Delete</DropdownMenuItem>
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
          <p className="text-sm text-muted-foreground">{words.length} of {meta.total}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-sm self-center">Page {page} of {meta.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit: {editing?.zolai}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Accuracy</Label>
              <Select value={editForm.accuracy} onValueChange={v => setEditForm(f => ({ ...f, accuracy: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="needs_review">Needs Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Audio URL</Label>
              <Input value={editForm.audioUrl} onChange={e => setEditForm(f => ({ ...f, audioUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label>Definition</Label>
              <Textarea value={editForm.definition} onChange={e => setEditForm(f => ({ ...f, definition: e.target.value }))} rows={3} />
            </div>
            <Button onClick={save} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
