import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

function getTodayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekAgo() {
  return new Date(Date.now() - 7 * 86400000);
}

const getCorpusStats = unstable_cache(async () => Promise.all([
  prisma.bibleVerse.count(),
  prisma.vocabWord.count(),
  prisma.wikiEntry.count(),
]), ["corpus-stats"], { revalidate: 300 });

const getTopStreaks = unstable_cache(async () => prisma.userStreak.findMany({
  orderBy: { currentStreak: "desc" }, take: 5,
  select: { currentStreak: true, totalXp: true, user: { select: { name: true } } },
}), ["top-streaks"], { revalidate: 60 });

export async function DashboardPage() {
  const today = getTodayStart();
  const week = getWeekAgo();

  const [
    stats, runs, recentWiki,
    [bibleCount, vocabCount, wikiCount],
    totalUsers, newToday, newWeek,
    activeSessions, topStreaks,
    completedLessons, totalXp,
  ] = await Promise.all([
    prisma.datasetStat.findMany({ orderBy: { label: "asc" } }),
    prisma.trainingRun.findMany({ orderBy: { startedAt: "desc" }, take: 5 }),
    prisma.wikiEntry.findMany({ orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, category: true, updatedAt: true } }),
    getCorpusStats(),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: week } } }),
    prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
    getTopStreaks(),
    prisma.userLessonProgress.count({ where: { status: "COMPLETE" } }),
    prisma.userStreak.aggregate({ _sum: { totalXp: true } }),
  ]);

  const statCards = [
    { label: "Bible Verses", value: bibleCount.toLocaleString() },
    { label: "Vocab Words", value: vocabCount.toLocaleString() },
    { label: "Wiki Entries", value: wikiCount.toLocaleString() },
    { label: "Training Runs", value: runs.length.toString() },
    { label: "Total Users", value: totalUsers.toLocaleString() },
    { label: "New Today", value: newToday.toString() },
    { label: "New This Week", value: newWeek.toString() },
    { label: "Active Sessions", value: activeSessions.toLocaleString() },
    { label: "Lessons Completed", value: completedLessons.toLocaleString() },
    { label: "Total XP", value: (totalXp._sum.totalXp ?? 0).toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Zolai AI Dashboard</h1>
        <p className="text-sm text-muted-foreground">Language preservation progress</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {statCards.map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{value}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Dataset Progress</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {stats.filter(s => s.target).map(s => {
              const pct = Math.min((s.value / s.target!) * 100, 100);
              return (
                <div key={s.id}>
                  <div className="flex justify-between mb-1">
                    <span>{s.label}</span>
                    <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full">
                    <div className="h-1.5 bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {stats.filter(s => s.target).length === 0 && <p className="text-muted-foreground">No targets set.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Learners</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {topStreaks.length === 0 && <p className="text-muted-foreground">No activity yet.</p>}
            {topStreaks.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="truncate max-w-[160px]">{s.user.name}</span>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>🔥 {s.currentStreak}d</span>
                  <span>⭐ {s.totalXp.toLocaleString()} XP</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Training Runs</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {runs.length === 0 && <p className="text-sm text-muted-foreground">No runs yet.</p>}
            {runs.map(r => (
              <div key={r.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.model} · {r.steps} steps</p>
                </div>
                <Badge variant={r.status === "complete" ? "default" : r.status === "failed" ? "destructive" : "secondary"}>{r.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Wiki Entries</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentWiki.length === 0 && <p className="text-sm text-muted-foreground">No entries yet.</p>}
            {recentWiki.map(w => (
              <div key={w.id} className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[200px]">{w.title}</span>
                <Badge variant="outline">{w.category}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
