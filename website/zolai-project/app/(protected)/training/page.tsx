import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getTrainingPageData } from "@/features/zolai/server/queries";
import { NewRunForm } from "@/features/zolai/components/new-run-form";

export default async function TrainingPage() {
  const { runs, stats } = await getTrainingPageData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Training</h1>
        <NewRunForm />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Training Runs</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {runs.length === 0 && <p className="text-sm text-muted-foreground">No runs yet.</p>}
            {runs.map((r) => (
              <Link key={r.id} href={`/training/${r.id}`} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 hover:bg-muted/50 rounded px-1 -mx-1 transition-colors">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.model} · {r.steps}{r.maxSteps ? `/${r.maxSteps}` : ""} steps
                    {r.startedAt && ` · ${new Date(r.startedAt).toLocaleDateString()}`}
                  </p>
                  {r.config && typeof r.config === "object" && "notes" in r.config && (
                    <p className="text-xs text-muted-foreground italic">{String((r.config as { notes?: string }).notes)}</p>
                  )}
                </div>
                <Badge variant={r.status === "complete" ? "default" : r.status === "failed" ? "destructive" : "secondary"}>
                  {r.status}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Dataset Stats</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stats.map((s) => (
              <div key={s.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{s.value.toLocaleString()}</span>
                    {s.target && (
                      <span className="text-xs text-muted-foreground">
                        / {s.target.toLocaleString()} ({Math.min((s.value / s.target) * 100, 100).toFixed(0)}%)
                      </span>
                    )}
                  </div>
                </div>
                {s.target && (
                  <div className="h-1.5 bg-muted rounded-full">
                    <div className="h-1.5 bg-primary rounded-full" style={{ width: `${Math.min((s.value / s.target) * 100, 100)}%` }} />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
