import prisma from "@/lib/prisma";
import { LessonPlanCard } from "@/features/admin/components/lesson-plan-card";

export default async function AdminLessonsPage() {
  const plans = await prisma.lessonPlan.findMany({
    orderBy: [{ level: "asc" }, { order: "asc" }],
    include: { units: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true } } } } },
  });

  const totalUnits = plans.reduce((s, p) => s + p.units.length, 0);
  const totalLessons = plans.reduce((s, p) => s + p.units.reduce((u, un) => u + un.lessons.length, 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lesson Plans</h1>
        <p className="text-sm text-muted-foreground">{plans.length} plans · {totalUnits} units · {totalLessons} lessons</p>
      </div>

      {plans.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground">No lesson plans yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map(plan => <LessonPlanCard key={plan.id} plan={plan} />)}
        </div>
      )}
    </div>
  );
}
