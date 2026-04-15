"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { client } from "@/lib/api/client";

const TYPES = ["LESSON", "VOCABULARY", "GRAMMAR", "ARTICLE", "STORY", "REFERENCE"] as const;
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary", REVIEW: "default", PUBLISHED: "default", ARCHIVED: "destructive",
};

interface Submission { id: string; title: string; status: string }

export function SubmitPage() {
  const [form, setForm] = useState({ title: "", description: "", content: "", resourceType: "ARTICLE", category: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<Submission | null>(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["my-submissions"],
    queryFn: async () => {
      const res = await client.api["content-submission"].submissions.$get();
      return res.json();
    },
  });
  const mySubmissions: Submission[] = (data as { data?: Submission[] })?.data ?? [];

  async function submit() {
    if (!form.title || !form.content) { toast.error("Title and content are required"); return; }
    setLoading(true);
    try {
      const res = await client.api["content-submission"].submissions.$post({ json: form });
      const json = await res.json();
      if (!(json as { success?: boolean }).success) throw new Error((json as { error?: { message?: string } }).error?.message);
      setSubmitted((json as { data: Submission }).data);
      toast.success("Draft saved!");
      qc.invalidateQueries({ queryKey: ["my-submissions"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function submitForReview(id: string) {
    const res = await client.api["content-submission"].submissions[":id"]["submit-for-review"].$post({ param: { id } });
    const json = await res.json();
    if ((json as { success?: boolean }).success) {
      toast.success("Submitted for review!");
      qc.invalidateQueries({ queryKey: ["my-submissions"] });
    } else toast.error("Failed");
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Submit Content</h1>
        <p className="text-sm text-muted-foreground">Contribute lessons, vocabulary, grammar notes, or articles to the Zolai community</p>
      </div>

      {submitted ? (
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
            <p className="font-semibold">Draft saved: {submitted.title}</p>
            <Button onClick={() => submitForReview(submitted.id)}>Submit for Review</Button>
            <Button variant="outline" onClick={() => setSubmitted(null)}>Submit Another</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>New Submission</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Basic Zolai Greetings" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={form.resourceType} onValueChange={v => setForm(f => ({ ...f, resourceType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. greetings, verbs…" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short summary (optional)" />
            </div>
            <div className="space-y-1">
              <Label>Content</Label>
              <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your content here…" className="min-h-[200px]" />
            </div>
            <Button onClick={submit} disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Save Draft
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold">My Submissions</h2>
        {mySubmissions.length === 0
          ? <p className="text-sm text-muted-foreground">No submissions yet.</p>
          : mySubmissions.map(s => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span className="font-medium truncate flex-1">{s.title}</span>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={STATUS_VARIANT[s.status] ?? "outline"}>{s.status}</Badge>
                {s.status === "DRAFT" && <Button size="sm" variant="outline" onClick={() => submitForReview(s.id)}>Submit</Button>}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
