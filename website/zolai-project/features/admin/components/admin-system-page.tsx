import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { SystemActions } from "./system-actions";

function getYesterdayDate() {
  return new Date(Date.now() - 86400000);
}

export async function AdminSystemPage() {
  const [
    userCount, bannedCount, sessionCount,
    blockedIps, securityEvents,
    vocabCount, confirmedVocab,
    wikiCount, bibleCount,
    trainingRuns, datasetStats,
    submissions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { banned: true } }),
    prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
    prisma.blockedIp.count(),
    prisma.securityEvent.count({ where: { createdAt: { gte: getYesterdayDate() } } }),
    prisma.vocabWord.count(),
    prisma.vocabWord.count({ where: { accuracy: "confirmed" } }),
    prisma.wikiEntry.count(),
    prisma.bibleVerse.count(),
    prisma.trainingRun.findMany({ orderBy: { startedAt: "desc" }, take: 3, select: { name: true, status: true, steps: true } }),
    prisma.datasetStat.findMany({ orderBy: { label: "asc" } }),
    prisma.learningResource.count({ where: { status: "REVIEW" } }),
  ]);

  const sections = [
    { title: "Users", stats: [{ label: "Total", value: userCount }, { label: "Banned", value: bannedCount }, { label: "Active Sessions", value: sessionCount }] },
    { title: "Security", stats: [{ label: "Blocked IPs", value: blockedIps }, { label: "Events (24h)", value: securityEvents }] },
    { title: "Content", stats: [{ label: "Vocab Words", value: vocabCount }, { label: "Confirmed", value: confirmedVocab }, { label: "Wiki Entries", value: wikiCount }, { label: "Bible Verses", value: bibleCount.toLocaleString() }] },
    { title: "Submissions", stats: [{ label: "Pending Review", value: submissions }] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Control</h1>
        <p className="text-sm text-muted-foreground">Super Admin only — full platform overview and controls</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sections.map(s => (
          <Card key={s.title}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">{s.title}</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {s.stats.map(st => (
                <div key={st.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{st.label}</span>
                  <span className="font-semibold">{st.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {datasetStats.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Dataset Progress</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {datasetStats.map(s => {
              const pct = s.target ? Math.min((s.value / s.target) * 100, 100) : null;
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.label}</span>
                    <span className="text-muted-foreground">{s.value.toLocaleString()}{s.unit ? ` ${s.unit}` : ""}{s.target ? ` / ${s.target.toLocaleString()} (${pct!.toFixed(0)}%)` : ""}</span>
                  </div>
                  {pct !== null && <div className="h-1.5 bg-muted rounded-full"><div className="h-1.5 bg-primary rounded-full" style={{ width: `${pct}%` }} /></div>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {trainingRuns.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Training Runs</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {trainingRuns.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>{r.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{r.steps} steps</span>
                  <Badge variant={r.status === "complete" ? "default" : r.status === "failed" ? "destructive" : "secondary"} className="text-xs">{r.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <SystemActions />
    </div>
  );
}
