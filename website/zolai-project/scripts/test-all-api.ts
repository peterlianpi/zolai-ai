#!/usr/bin/env bun
/**
 * Comprehensive API Test Suite - All Endpoints
 */

import prisma from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const BASE_URL = process.env.API_URL || "http://localhost:3000";
const TEST_ADMIN_EMAIL = "test-admin@zolai.space";
const TEST_USER_EMAIL = "test-user@zolai.space";
const TEST_PASSWORD = "TestPass123!";

let adminCookie = "";
let userCookie = "";
let adminCSRF = "";
let userCSRF = "";
let passed = 0;
let failed = 0;

async function seedAccounts() {
  try {
    const tempAuth = betterAuth({
      database: prismaAdapter(prisma, { provider: "postgresql" }),
      emailAndPassword: { enabled: true },
    });
    const ctx = await tempAuth.$context;
    const hash = await ctx.password.hash(TEST_PASSWORD);

    await prisma.user.upsert({
      where: { email: TEST_ADMIN_EMAIL },
      update: {},
      create: {
        id: "test_admin_001",
        email: TEST_ADMIN_EMAIL,
        name: "Test Admin",
        emailVerified: true,
        role: "ADMIN",
      },
    });

    await prisma.account.upsert({
      where: { id: "test_admin_001_acc" },
      update: {},
      create: {
        id: "test_admin_001_acc",
        accountId: TEST_ADMIN_EMAIL,
        providerId: "credential",
        userId: "test_admin_001",
        password: hash,
      },
    });

    await prisma.user.upsert({
      where: { email: TEST_USER_EMAIL },
      update: {},
      create: {
        id: "test_user_001",
        email: TEST_USER_EMAIL,
        name: "Test User",
        emailVerified: true,
        role: "USER",
      },
    });

    await prisma.account.upsert({
      where: { id: "test_user_001_acc" },
      update: {},
      create: {
        id: "test_user_001_acc",
        accountId: TEST_USER_EMAIL,
        providerId: "credential",
        userId: "test_user_001",
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
  if (!res.ok) throw new Error(`Failed to get CSRF token: ${res.status}`);
  const setCookies = res.headers.getSetCookie?.() || [];
  const csrfCookie = setCookies.find(c => c.includes("__csrf-token"));
  const data = await res.json();
  return { token: data.token || data, cookie: csrfCookie };
}

async function test(name: string, method: string, path: string, body?: unknown, cookie?: string, csrf?: string) {
  const start = Date.now();
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (cookie) headers.Cookie = cookie;
    if (csrf && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      headers["X-CSRF-Token"] = csrf;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const duration = Date.now() - start;
    const success = res.ok;
    const icon = success ? "✓" : "✗";

    console.log(`${icon} ${name.padEnd(50)} ${method.padEnd(6)} ${res.status} (${duration}ms)`);
    return { status: res.status, success, duration };
  } catch (error) {
    console.log(`✗ ${name.padEnd(50)} ${method.padEnd(6)} ERROR`);
    return { status: 0, success: false, duration: 0 };
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════════════════════════════════════════════╗");
  console.log("║                         Comprehensive API Test Suite - All Endpoints                             ║");
  console.log("╚════════════════════════════════════════════════════════════════════════════════════════════════════╝\n");

  await seedAccounts();

  console.log("🔐 Authenticating...");
  adminCookie = await authenticate(TEST_ADMIN_EMAIL);
  userCookie = await authenticate(TEST_USER_EMAIL);

  console.log("🔑 Getting CSRF tokens...");
  const adminCSRFData = await getCSRFToken(adminCookie);
  const userCSRFData = await getCSRFToken(userCookie);
  adminCSRF = adminCSRFData.token;
  userCSRF = userCSRFData.token;
  if (adminCSRFData.cookie) adminCookie += "; " + adminCSRFData.cookie.split(";")[0];
  if (userCSRFData.cookie) userCookie += "; " + userCSRFData.cookie.split(";")[0];

  // PUBLIC ENDPOINTS
  console.log("\n📡 Public Endpoints");
  console.log("─".repeat(100));
  
  let result = await test("Health Check", "GET", "/api/health");
  result.success ? passed++ : failed++;

  result = await test("CSRF Token", "GET", "/api/csrf-token");
  result.success ? passed++ : failed++;

  // AUTH ENDPOINTS
  console.log("\n🔐 Auth Endpoints");
  console.log("─".repeat(100));

  result = await test("Sign In", "POST", "/api/auth/sign-in/email", 
    { email: TEST_ADMIN_EMAIL, password: TEST_PASSWORD });
  result.success ? passed++ : failed++;

  // ADMIN ENDPOINTS
  console.log("\n👨‍💼 Admin Endpoints");
  console.log("─".repeat(100));

  result = await test("Admin Stats", "GET", "/api/admin/stats", undefined, adminCookie);
  result.success ? passed++ : failed++;

  result = await test("Admin Recent Activity", "GET", "/api/admin/recent-activity", undefined, adminCookie);
  result.success ? passed++ : failed++;

  result = await test("Admin Dashboard Layout", "GET", "/api/admin/dashboard-layout", undefined, adminCookie);
  result.success ? passed++ : failed++;

  result = await test("Admin Analytics", "GET", "/api/admin/analytics", undefined, adminCookie);
  result.success ? passed++ : failed++;

  // SETTINGS
  console.log("\n⚙️  Settings Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Site Settings", "GET", "/api/admin/site-settings", undefined, adminCookie);
  result.success ? passed++ : failed++;

  result = await test("Update Site Setting", "PUT", "/api/admin/site-settings",
    { key: "test_" + Date.now(), value: "test" }, adminCookie, adminCSRF);
  result.success ? passed++ : failed++;

  // MENUS
  console.log("\n🍔 Menu Endpoints");
  console.log("─".repeat(100));

  result = await test("Create Menu", "POST", "/api/menus",
    { name: "Test", slug: "test-" + Date.now() }, adminCookie, adminCSRF);
  result.success ? passed++ : failed++;

  // REDIRECTS
  console.log("\n🔀 Redirect Endpoints");
  console.log("─".repeat(100));

  result = await test("Create Redirect", "POST", "/api/redirects",
    { source: "/old-" + Date.now(), destination: "/new", statusCode: 301 }, adminCookie, adminCSRF);
  result.success ? passed++ : failed++;

  result = await test("Get Redirects", "GET", "/api/redirects", undefined, adminCookie);
  result.success ? passed++ : failed++;

  // MEDIA
  console.log("\n🖼️  Media Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Media", "GET", "/api/media", undefined, adminCookie);
  result.success ? passed++ : failed++;

  // COMMENTS
  console.log("\n💬 Comment Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Comments", "GET", "/api/comments", undefined, userCookie);
  result.success ? passed++ : failed++;

  // NOTIFICATIONS
  console.log("\n🔔 Notification Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Notifications", "GET", "/api/notifications", undefined, userCookie);
  result.success ? passed++ : failed++;

  // PROFILE
  console.log("\n👤 Profile Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Profile", "GET", "/api/profile", undefined, userCookie);
  result.success ? passed++ : failed++;

  // PREFERENCES
  console.log("\n⚡ Preferences Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Preferences", "GET", "/api/preferences", undefined, userCookie);
  result.success ? passed++ : failed++;

  // SECURITY
  console.log("\n🔒 Security Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Device Sessions", "GET", "/api/security/device-sessions", undefined, adminCookie);
  result.success ? passed++ : failed++;

  result = await test("Get Security Alerts", "GET", "/api/security/alerts", undefined, adminCookie);
  result.success ? passed++ : failed++;

  // ORGANIZATIONS
  console.log("\n🏢 Organization Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Organizations", "GET", "/api/organizations", undefined, userCookie);
  result.success ? passed++ : failed++;

  // TEMPLATES
  console.log("\n📋 Template Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Templates", "GET", "/api/templates", undefined, adminCookie);
  result.success ? passed++ : failed++;

  // ZOLAI
  console.log("\n🤖 Zolai AI Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Zolai Stats", "GET", "/api/zolai/stats", undefined, userCookie);
  result.success ? passed++ : failed++;

  result = await test("Get Zolai Wiki", "GET", "/api/zolai/wiki", undefined, userCookie);
  result.success ? passed++ : failed++;

  // DICTIONARY
  console.log("\n📚 Dictionary Endpoints");
  console.log("─".repeat(100));

  result = await test("Search Dictionary", "GET", "/api/dictionary/search?q=test", undefined, userCookie);
  result.success ? passed++ : failed++;

  result = await test("Get Dictionary Stats", "GET", "/api/dictionary/stats", undefined, userCookie);
  result.success ? passed++ : failed++;

  // GRAMMAR
  console.log("\n✏️  Grammar Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Grammar Lessons", "GET", "/api/grammar/lessons", undefined, userCookie);
  result.success ? passed++ : failed++;

  // FORUM
  console.log("\n💭 Forum Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Forum", "GET", "/api/forum", undefined, userCookie);
  result.success ? passed++ : failed++;

  // AUDIO
  console.log("\n🎵 Audio Pronunciation Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Audio", "GET", "/api/audio", undefined, userCookie);
  result.success ? passed++ : failed++;

  // TRANSLATION
  console.log("\n🌐 Translation Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Translation", "GET", "/api/translation", undefined, userCookie);
  result.success ? passed++ : failed++;

  // LESSONS
  console.log("\n📖 Lesson Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Lesson Plans", "GET", "/api/lessons", undefined, userCookie);
  result.success ? passed++ : failed++;

  // CURRICULUM
  console.log("\n🎓 Curriculum Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Curriculum", "GET", "/api/curriculum", undefined, userCookie);
  result.success ? passed++ : failed++;

  // SUPPORT
  console.log("\n🆘 Support Endpoints");
  console.log("─".repeat(100));

  result = await test("Get Support", "GET", "/api/support", undefined, userCookie);
  result.success ? passed++ : failed++;

  // SUMMARY
  console.log("\n════════════════════════════════════════════════════════════════════════════════════════════════════");
  console.log("📊 Test Summary");
  console.log("════════════════════════════════════════════════════════════════════════════════════════════════════");
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log("\n✅ All tests passed!");
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed`);
    process.exit(1);
  }
}

main().catch(console.error);
