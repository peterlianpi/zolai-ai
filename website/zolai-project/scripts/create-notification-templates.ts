#!/usr/bin/env bun

/**
 * Script to create default notification templates
 * Run with: bun run scripts/create-notification-templates.ts
 */

import "dotenv/config";

import { createDefaultTemplates } from "../lib/scripts/create-default-notification-templates";

async function main() {
  console.log("🚀 Starting notification template creation...");
  await createDefaultTemplates();
  console.log("✅ Notification template creation completed!");
}

main().catch((error) => {
  console.error("❌ Error creating notification templates:", error);
  process.exit(1);
});
