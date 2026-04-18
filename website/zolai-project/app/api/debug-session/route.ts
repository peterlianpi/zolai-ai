import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/server";

export async function GET() {
  const session = await getServerSession();
  return NextResponse.json({ session: session ? { userId: session.user.id, role: session.user.role } : null });
}
