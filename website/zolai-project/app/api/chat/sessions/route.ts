// app/api/chat/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessions = await prisma.chatSession.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: { id: true, title: true, provider: true, model: true, updatedAt: true },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, provider, model } = await req.json();

  const newSession = await prisma.chatSession.create({
    data: {
      userId: session.user.id,
      title: title || "New Chat",
      provider: provider || "gemini",
      model: model || "gemini-2.0-flash",
    },
    select: { id: true, title: true, provider: true, model: true, createdAt: true },
  });

  return NextResponse.json(newSession, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.chatSession.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
