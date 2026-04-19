import prisma from "@/lib/prisma";

export async function getPendingSubmissions() {
  return prisma.learningResource.findMany({
    where: { status: "REVIEW" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      resourceType: true,
      status: true,
      createdAt: true,
      author: { select: { name: true, email: true } },
    },
  });
}
