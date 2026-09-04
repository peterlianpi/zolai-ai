import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const N8N_MERGE_WEBHOOK = process.env.N8N_CONTRIBUTION_MERGE_WEBHOOK_URL ?? "";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await req.json(); // "approve" | "reject"

  const contribution = await prisma.contribution.update({
    where: { id },
    data: {
      status: action === "approve" ? "approved" : "rejected",
      reviewerId: session.user.id,
    },
  });

  // Trigger n8n merge workflow on approval
  if (action === "approve" && N8N_MERGE_WEBHOOK) {
    fetch(N8N_MERGE_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contribution }),
    }).catch(() => {});
  }

  return NextResponse.json({ id, status: contribution.status });
}
