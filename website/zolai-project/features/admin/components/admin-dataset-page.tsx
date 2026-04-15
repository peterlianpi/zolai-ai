"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Stat { id: string; label: string; value: number; target: number | null; unit: string | null }
interface Run { id: string; name: string; model: string; status: string; steps: number; maxSteps: number | null; startedAt: string }

import { client } from "@/lib/api/client";

export function AdminDatasetPage() {
  const qc = useQueryClient();
  const [statDialog, setStatDialog] = useState(false);
  const [statForm, setStatForm] = useState({ label: "", value: "", target: "", unit: "" });

  const { data: statsData } = useQuery({ queryKey: ["admin-dataset-stats"], queryFn: async () => { const res = await client.api.zolai.stats.$get(); return res.json(); } });
  const { data: runsData } = useQuery({ queryKey: ["admin-training-runs"], queryFn: async () => { const res = await client.api.zolai.training.$get(); return res.json(); } });

  const stats: Stat[] = statsData?.data ?? [];
  const runs: Run[] = runsData?.data ?? [];

  async function saveStat() {
    if (!statForm.label || !statForm.value) return;
    try {
      const res = await client.api.admin.dataset.$post({ json: { label: statForm.label, value: parseInt(statForm.value), target: statForm.target ? parseInt(statForm.target) : undefined, unit: statForm.unit || undefined } });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["admin-dataset-stats"] });
      toast.success("Stat saved");
      setStatDialog(false);
      setStatForm({ label: "", value: "", target: "", unit: "" });
    } catch { toast.error("Failed to save"); }
  }

  async function deleteStat(id: string) {
    if (!confirm("Delete this stat?")) return;
    try {
      const res = await client.api.admin.dataset[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["admin-dataset-stats"] });
      toast.success("Deleted");
    } catch { toast.error("Failed"); }
  }

  async function deleteRun(id: string, name: string) {
    if (!confirm(`Delete run "${name}"?`)) return;
    try {
      const res = await client.api.admin.training[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["admin-training-runs"] });
      toast.success("Deleted");
    } catch { toast.error("Failed"); }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dataset & Training</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Dataset Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Dataset Stats</CardTitle>
            <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setStatDialog(true)}>
              <Plus className="w-3.5 h-3.5" />Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.map(s => (
              <div key={s.id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium truncate">{s.label}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">
                      {s.value.toLocaleString()}{s.unit ? ` ${s.unit}` : ""}
                      {s.target ? ` / ${s.target.toLocaleString()}` : ""}
                    </span>
                  </div>
                  {s.target && (
                    <div className="h-1.5 bg-muted rounded-full">
                      <div className="h-1.5 bg-primary rounded-full" style={{ width: `${Math.min((s.value / s.target) * 100, 100)}%` }} />
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => deleteStat(s.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            ))}
            {stats.length === 0 && <p className="text-sm text-muted-foreground">No stats yet.</p>}
          </CardContent>
        </Card>

        {/* Training Runs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Training Runs</CardTitle>
            <Button size="sm" variant="outline" className="h-7 gap-1" asChild>
              <Link href="/training"><Plus className="w-3.5 h-3.5" />New Run</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm font-medium">{r.name}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "complete" ? "default" : r.status === "failed" ? "destructive" : "secondary"} className="text-xs">{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.steps}{r.maxSteps ? `/${r.maxSteps}` : ""}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(r.startedAt), { addSuffix: true })}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild><Link href={`/training/${r.id}`}>View Details</Link></DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteRun(r.id, r.name)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {runs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-4">No runs yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add stat dialog */}
      <Dialog open={statDialog} onOpenChange={setStatDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add / Update Dataset Stat</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Label (unique key)</Label><Input value={statForm.label} onChange={e => setStatForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. parallel_sentences" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Value</Label><Input type="number" value={statForm.value} onChange={e => setStatForm(f => ({ ...f, value: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Target (optional)</Label><Input type="number" value={statForm.target} onChange={e => setStatForm(f => ({ ...f, target: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label>Unit (optional)</Label><Input value={statForm.unit} onChange={e => setStatForm(f => ({ ...f, unit: e.target.value }))} placeholder="e.g. entries, MB" /></div>
            <Button onClick={saveStat} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
