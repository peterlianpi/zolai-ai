import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [pendingContributions, subscriberCount, recentRuns, lastPublishRun] = await Promise.all([
    prisma.contribution.count({ where: { status: "pending" } }),
    prisma.telegramSubscriber.count({ where: { active: true } }),
    prisma.pipelineRun.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.pipelineRun.findFirst({
      where: { stage: "publish-hf", status: "done" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    pendingContributions,
    subscriberCount,
    recentRuns,
    lastPublish: lastPublishRun?.createdAt?.toISOString() ?? null,
  });
}
