import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const N8N_CONTRIBUTION_WEBHOOK = process.env.N8N_CONTRIBUTION_WEBHOOK_URL ?? "";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const body = await req.json();
  const { type, zolaiText, englishText, notes } = body;

  if (!type || !zolaiText || !englishText) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const contribution = await prisma.contribution.create({
    data: {
      type,
      zolaiText,
      englishText,
      notes,
      submitterId: session?.user?.id ?? null,
    },
  });

  // Notify n8n — fire and forget
  if (N8N_CONTRIBUTION_WEBHOOK) {
    fetch(N8N_CONTRIBUTION_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contribution }),
    }).catch(() => {});
  }

  return NextResponse.json({ id: contribution.id, status: "pending" });
}

export async function GET() {
  const contributions = await prisma.contribution.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { submitter: { select: { name: true, email: true } } },
  });
  return NextResponse.json(contributions);
}
