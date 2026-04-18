#!/usr/bin/env bun
/**
 * Settings Update & Save Test Suite
 * Tests all settings endpoints for create, read, update operations
 */

import prisma from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const BASE_URL = process.env.API_URL || "http://localhost:3000";
const TEST_EMAIL = "settings-update-test@zolai.space";
const TEST_PASSWORD = "TestPass123!";

let passed = 0;
let failed = 0;

async function seedAccount() {
  try {
    const tempAuth = betterAuth({
      database: prismaAdapter(prisma, { provider: "postgresql" }),
      emailAndPassword: { enabled: true },
    });
    const ctx = await tempAuth.$context;
    const hash = await ctx.password.hash(TEST_PASSWORD);

    await prisma.user.upsert({
      where: { email: TEST_EMAIL },
      update: {},
      create: {
        id: "settings_update_001",
        email: TEST_EMAIL,
        name: "Settings Update Test",
        emailVerified: true,
        role: "ADMIN",
      },
    });

    await prisma.account.upsert({
      where: { id: "settings_update_001_acc" },
      update: {},
      create: {
        id: "settings_update_001_acc",
        accountId: TEST_EMAIL,
        providerId: "credential",
        userId: "settings_update_001",
        password: hash,
      },
    });
  } catch (error) {
    console.error("❌ Failed to seed:", error);
    throw error;
  }
}

async function authenticate(email: string) {
  const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  });
  const cookies = res.headers.getSetCookie?.() || [];
  return cookies.map(c => c.split(";")[0]).join("; ");
}

async function getCSRFToken(cookie: string) {
  const res = await fetch(`${BASE_URL}/api/csrf-token`, {
    headers: { Cookie: cookie },
  });
  const setCookies = res.headers.getSetCookie?.() || [];
  const csrfCookie = setCookies.find(c => c.includes("__csrf-token"));
  const data = await res.json();
  return { token: data.token || data, cookie: csrfCookie };
}

async function test(name: string, check: () => Promise<boolean>) {
  try {
    const result = await check();
    if (result) {
      console.log(`✓ ${name.padEnd(60)}`);
      passed++;
    } else {
      console.log(`✗ ${name.padEnd(60)}`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ ${name.padEnd(60)} [ERROR: ${error}]`);
    failed++;
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════════════════════════════════════════════╗");
  console.log("║                    Settings Update & Save Test Suite                                            ║");
  console.log("╚════════════════════════════════════════════════════════════════════════════════════════════════════╝\n");

  await seedAccount();
  const cookie = await authenticate(TEST_EMAIL);
  const csrfData = await getCSRFToken(cookie);
  const fullCookie = cookie + (csrfData.cookie ? "; " + csrfData.cookie.split(";")[0] : "");

  // GET SETTINGS
  console.log("\n📖 Read Settings");
  console.log("─".repeat(100));

  await test("Get all settings", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      headers: { Cookie: fullCookie },
    });
    return res.status === 200;
  });

  // UPDATE INDIVIDUAL SETTINGS
  console.log("\n✏️  Update Individual Settings");
  console.log("─".repeat(100));

  const testSettings = [
    { key: "site_name", value: "Zolai AI Platform" },
    { key: "site_description", value: "Advanced AI Language Learning Platform" },
    { key: "site_url", value: "https://zolai.space" },
    { key: "noreply_email", value: "noreply@zolai.space" },
    { key: "under_development", value: "false" },
    { key: "allow_registration", value: "true" },
    { key: "require_email_verification", value: "true" },
    { key: "send_welcome_email", value: "true" },
    { key: "comments_enabled", value: "true" },
    { key: "comments_moderation", value: "false" },
  ];

  for (const setting of testSettings) {
    await test(`Update ${setting.key}`, async () => {
      const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: fullCookie,
          "X-CSRF-Token": csrfData.token,
        },
        body: JSON.stringify(setting),
      });
      return res.status === 200;
    });
  }

  // VERIFY SETTINGS ENDPOINT
  console.log("\n✔️  Verify Settings Endpoint");
  console.log("─".repeat(100));

  await test("GET settings returns 200", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      headers: { Cookie: fullCookie },
    });
    return res.status === 200;
  });

  // BATCH UPDATE
  console.log("\n📦 Batch Update Settings");
  console.log("─".repeat(100));

  const batchSettings = [
    { key: "site_timezone", value: "Asia/Yangon" },
    { key: "default_locale", value: "en" },
    { key: "posts_per_page", value: "20" },
  ];

  for (const setting of batchSettings) {
    await test(`Batch update ${setting.key}`, async () => {
      const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: fullCookie,
          "X-CSRF-Token": csrfData.token,
        },
        body: JSON.stringify(setting),
      });
      return res.status === 200;
    });
  }

  // EDGE CASES
  console.log("\n⚠️  Edge Cases");
  console.log("─".repeat(100));

  await test("Update with empty value", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: fullCookie,
        "X-CSRF-Token": csrfData.token,
      },
      body: JSON.stringify({ key: "test_empty", value: "" }),
    });
    return res.status === 200;
  });

  await test("Update with special characters", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: fullCookie,
        "X-CSRF-Token": csrfData.token,
      },
      body: JSON.stringify({ key: "test_special", value: "Test & <special> \"chars\"" }),
    });
    return res.status === 200;
  });

  await test("Update with long value", async () => {
    const longValue = "A".repeat(1000);
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: fullCookie,
        "X-CSRF-Token": csrfData.token,
      },
      body: JSON.stringify({ key: "test_long", value: longValue }),
    });
    return res.status === 200;
  });

  await test("Update without CSRF token (should fail)", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: fullCookie,
      },
      body: JSON.stringify({ key: "test_no_csrf", value: "test" }),
    });
    return res.status === 403;
  });

  await test("Update with invalid key (empty)", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: fullCookie,
        "X-CSRF-Token": csrfData.token,
      },
      body: JSON.stringify({ key: "", value: "test" }),
    });
    return res.status === 400;
  });

  // PERFORMANCE
  console.log("\n⚡ Performance");
  console.log("─".repeat(100));

  await test("Update completes in < 500ms", async () => {
    const start = Date.now();
    await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: fullCookie,
        "X-CSRF-Token": csrfData.token,
      },
      body: JSON.stringify({ key: "perf_test", value: "test" }),
    });
    return Date.now() - start < 500;
  });

  // SUMMARY
  console.log("\n════════════════════════════════════════════════════════════════════════════════════════════════════");
  console.log("📊 Settings Update Test Summary");
  console.log("════════════════════════════════════════════════════════════════════════════════════════════════════");
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log("\n✅ All settings update tests passed!");
    process.exit(0);
  } else {
    console.log(`\n❌ ${failed} test(s) failed`);
    process.exit(1);
  }
}

main().catch(console.error);
