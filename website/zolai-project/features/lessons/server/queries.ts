import prisma from "@/lib/prisma";

export async function getAdminLessonPlans() {
  return prisma.lessonPlan.findMany({
    orderBy: [{ level: "asc" }, { order: "asc" }],
    include: {
      units: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true } } },
      },
    },
  });
}
