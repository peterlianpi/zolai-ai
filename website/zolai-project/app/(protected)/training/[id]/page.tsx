// import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrainingRunById } from "@/features/zolai/server/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { LossCurve } from "@/features/zolai/components/loss-curve";

export default async function TrainingRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await getTrainingRunById(id);

  const lossData: { step: number; loss: number }[] = run.lossJson
    ? JSON.parse(run.lossJson)
    : [];

  const duration = run.endedAt && run.startedAt
    ? Math.round((run.endedAt.getTime() - run.startedAt.getTime()) / 60000)
    : null;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/training"><ArrowLeft className="w-4 h-4 mr-1" />All Runs</Link>
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{run.name}</h1>
          <p className="text-sm text-muted-foreground">{run.model}</p>
        </div>
        <Badge variant={run.status === "complete" ? "default" : run.status === "failed" ? "destructive" : "secondary"} className="text-sm">
          {run.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Steps", value: `${run.steps}${run.maxSteps ? ` / ${run.maxSteps}` : ""}` },
          { label: "Started", value: format(run.startedAt, "MMM d, HH:mm") },
          { label: "Ended", value: run.endedAt ? format(run.endedAt, "MMM d, HH:mm") : "—" },
          { label: "Duration", value: duration ? `${duration}m` : "—" },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent><p className="font-semibold text-sm">{value}</p></CardContent>
          </Card>
        ))}
      </div>

      {run.config && typeof run.config === "object" && "notes" in run.config && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{String((run.config as { notes?: string }).notes)}</p></CardContent>
        </Card>
      )}

      {lossData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Loss Curve</CardTitle></CardHeader>
          <CardContent>
            <LossCurve data={lossData} />
          </CardContent>
        </Card>
      )}

      {lossData.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No loss data recorded for this run.</p>
      )}
    </div>
  );
}
