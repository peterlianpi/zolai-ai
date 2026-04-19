import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Emergency endpoint to clear all sessions
 * DELETE /api/admin/clear-sessions
 */
export async function DELETE() {
  try {
    const result = await prisma.session.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: `Cleared ${result.count} sessions`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error clearing sessions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear sessions" },
      { status: 500 }
    );
  }
}
