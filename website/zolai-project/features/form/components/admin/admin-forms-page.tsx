"use client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { client } from "@/lib/api/client";

interface Form { id: string; name: string; slug: string; isActive: boolean; submitCount: number; createdAt: string }

export function AdminFormsPage() {
  const { data: formsData } = useQuery<{ success: boolean; data: Form[] }>({
    queryKey: ["admin-forms"],
    queryFn: async () => {
      const res = await client.api.forms.$get({ query: {} });
      const json = await res.json() as { success: boolean; data: Form[] };
      return json;
    },
  });

  const forms = formsData?.data ?? [];

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
        <CardHeader><CardTitle>Recent Submissions</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4 text-center">Select a form to view its submissions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
