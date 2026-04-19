#!/usr/bin/env tsx

/**
 * Clear all sessions from database
 * Use this to fix redirect loops caused by stale sessions
 */

import prisma from "../lib/prisma";

async function clearSessions() {
  console.log("🗑️  Clearing all sessions from database...");
  
  try {
    const result = await prisma.session.deleteMany({});
    console.log(`✅ Deleted ${result.count} sessions`);
    
    // Also clear any stale verification tokens
    const tokens = await prisma.verification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    console.log(`✅ Deleted ${tokens.count} expired verification tokens`);
    
    console.log("\n✨ Database cleaned! You can now log in fresh.");
  } catch (error) {
    console.error("❌ Error clearing sessions:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearSessions();
