"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { client } from "@/lib/api/client";

interface Form { id: string; name: string; slug: string; isActive: boolean; submitCount: number; createdAt: string }
interface Submission { id: string; formId: string; data: Record<string, string>; createdAt: string }

export function AdminFormsPage() {
  const { data: formsData } = useQuery<{ data: Form[] }>({
    queryKey: ["admin-forms"],
    queryFn: async () => { const res = await client.api.forms.$get(); return res.json(); },
  });
  const { data: subsData } = useQuery<{ data: Submission[] }>({
    queryKey: ["admin-submissions"],
    queryFn: async () => { const res = await client.api.forms.submissions.$get({ query: { limit: "20" } }); return res.json(); },
  });

  const forms = formsData?.data ?? [];
  const subs  = subsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Forms & Submissions</h1>
        <Button asChild size="sm"><Link href="/admin/forms/new"><Plus className="w-4 h-4 mr-1" />New Form</Link></Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Forms ({forms.length})</CardTitle></CardHeader>
        <CardContent>
          {forms.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No forms yet. Run the seeder to populate.</p>
          ) : (
            <div className="space-y-2">
              {forms.map(f => (
                <div key={f.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                  <div>
                    <p className="font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">/{f.slug} · {f.submitCount} submissions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={f.isActive ? "default" : "secondary"}>{f.isActive ? "Active" : "Inactive"}</Badge>
                    <Link href={`/admin/forms/${f.id}`} className="text-xs text-primary hover:underline">View</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Submissions ({subs.length})</CardTitle></CardHeader>
        <CardContent>
          {subs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No submissions yet.</p>
          ) : (
            <div className="space-y-2">
              {subs.map(s => (
                <div key={s.id} className="py-2 border-b last:border-0 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {Object.entries(s.data ?? {}).map(([k, v]) => (
                      <span key={k} className="text-xs"><span className="font-medium">{k}:</span> {String(v).slice(0, 50)}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
