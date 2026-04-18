#!/usr/bin/env bun
/**
 * API Endpoint Test Suite
 * Tests all mutation endpoints with CSRF protection
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

async function seedAccounts() {
  console.log("🌱 Seeding test accounts...\n");
  try {
    const tempAuth = betterAuth({
      database: prismaAdapter(prisma, { provider: "postgresql" }),
      emailAndPassword: { enabled: true },
    });
    const ctx = await tempAuth.$context;
    const hash = await ctx.password.hash(TEST_PASSWORD);

    // Admin
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

    // User
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

    console.log("✅ Test accounts created");
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

  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) throw new Error("No session cookie");

  // Extract all cookies from response
  const cookies = res.headers.getSetCookie?.() || [];
  return cookies.map(c => c.split(";")[0]).join("; ");
}

async function getCSRFToken(cookie: string) {
  const res = await fetch(`${BASE_URL}/api/csrf-token`, {
    headers: { Cookie: cookie },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to get CSRF token: ${res.status}`);
  }

  // Get the CSRF cookie from response
  const setCookies = res.headers.getSetCookie?.() || [];
  const csrfCookie = setCookies.find(c => c.includes("__csrf-token"));
  
  const data = await res.json();
  return { token: data.token || data, cookie: csrfCookie };
}

async function test(
  name: string,
  method: string,
  path: string,
  body?: unknown,
  cookie?: string,
  csrf?: string
) {
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

    console.log(`${icon} ${name.padEnd(45)} ${method.padEnd(6)} ${res.status} (${duration}ms)`);

    if (!success) {
      const text = await res.text();
      console.log(`  └─ ${text.substring(0, 100)}`);
    }

    return { status: res.status, success, duration };
  } catch (error) {
    console.log(`✗ ${name.padEnd(45)} ${method.padEnd(6)} ERROR`);
    console.log(`  └─ ${error}`);
    return { status: 0, success: false, duration: 0 };
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════════════════════════════════════════════╗");
  console.log("║                         API Endpoint Test Suite                                                   ║");
  console.log("╚════════════════════════════════════════════════════════════════════════════════════════════════════╝\n");

  await seedAccounts();

  console.log("\n🔐 Authenticating...");
  adminCookie = await authenticate(TEST_ADMIN_EMAIL);
  userCookie = await authenticate(TEST_USER_EMAIL);
  console.log("✅ Admin authenticated");
  console.log("✅ User authenticated");

  console.log("\n🔑 Getting CSRF tokens...");
  const adminCSRFData = await getCSRFToken(adminCookie);
  const userCSRFData = await getCSRFToken(userCookie);
  adminCSRF = adminCSRFData.token;
  userCSRF = userCSRFData.token;
  
  // Merge CSRF cookies with session cookies
  if (adminCSRFData.cookie) adminCookie += "; " + adminCSRFData.cookie.split(";")[0];
  if (userCSRFData.cookie) userCookie += "; " + userCSRFData.cookie.split(";")[0];
  
  console.log("✅ Admin CSRF token obtained");
  console.log("✅ User CSRF token obtained");

  let passed = 0;
  let failed = 0;

  // ⚙️ SETTINGS ENDPOINTS
  console.log("\n⚙️  Settings Endpoints (Admin Only)");
  console.log("─".repeat(100));

  let result = await test("Get All Settings", "GET", "/api/admin/site-settings", undefined, adminCookie);
  result.success ? passed++ : failed++;

  result = await test("Update Site Setting (Admin)", "PUT", "/api/admin/site-settings", 
    { key: "test_key", value: "test_value" }, adminCookie, adminCSRF);
  result.success ? passed++ : failed++;

  result = await test("Update Setting (No CSRF - Should Fail)", "PUT", "/api/admin/site-settings",
    { key: "test_key", value: "test_value" }, adminCookie);
  result.success === false ? passed++ : failed++;

  result = await test("Update Setting (User - Should Fail)", "PUT", "/api/admin/site-settings",
    { key: "test_key", value: "test_value" }, userCookie, userCSRF);
  result.success === false ? passed++ : failed++;

  // 📄 CONTENT ENDPOINTS
  console.log("\n📄 Content Endpoints");
  console.log("─".repeat(100));

  result = await test("Create Content (Admin)", "POST", "/api/content",
    { title: "Test", slug: "test", content: "Test content" }, adminCookie, adminCSRF);
  result.success ? passed++ : failed++;

  result = await test("Create Content (No CSRF - Should Fail)", "POST", "/api/content",
    { title: "Test", slug: "test", content: "Test content" }, adminCookie);
  result.success === false ? passed++ : failed++;

  // 🍔 MENU ENDPOINTS
  console.log("\n🍔 Menu Endpoints");
  console.log("─".repeat(100));

  result = await test("Create Menu (Admin)", "POST", "/api/menus",
    { label: "Test Menu", url: "/test" }, adminCookie, adminCSRF);
  result.success ? passed++ : failed++;

  result = await test("Create Menu (No CSRF - Should Fail)", "POST", "/api/menus",
    { label: "Test Menu", url: "/test" }, adminCookie);
  result.success === false ? passed++ : failed++;

  // 🔀 REDIRECT ENDPOINTS
  console.log("\n🔀 Redirect Endpoints");
  console.log("─".repeat(100));

  result = await test("Create Redirect (Admin)", "POST", "/api/redirects",
    { from: "/old", to: "/new", statusCode: 301 }, adminCookie, adminCSRF);
  result.success ? passed++ : failed++;

  result = await test("Create Redirect (No CSRF - Should Fail)", "POST", "/api/redirects",
    { from: "/old", to: "/new", statusCode: 301 }, adminCookie);
  result.success === false ? passed++ : failed++;

  // 📧 NEWSLETTER ENDPOINTS
  console.log("\n📧 Newsletter Endpoints");
  console.log("─".repeat(100));

  result = await test("Subscribe Newsletter (Public)", "POST", "/api/newsletter/subscribe",
    { email: "test@example.com" });
  result.success ? passed++ : failed++;

  result = await test("Create Campaign (Admin)", "POST", "/api/newsletter/campaigns",
    { subject: "Test", content: "Test" }, adminCookie, adminCSRF);
  result.success ? passed++ : failed++;

  // 💬 COMMENT ENDPOINTS
  console.log("\n💬 Comment Endpoints");
  console.log("─".repeat(100));

  result = await test("Create Comment (User)", "POST", "/api/comments",
    { content: "Test comment", postId: "test" }, userCookie, userCSRF);
  result.success ? passed++ : failed++;

  result = await test("Create Comment (No CSRF - Should Fail)", "POST", "/api/comments",
    { content: "Test comment", postId: "test" }, userCookie);
  result.success === false ? passed++ : failed++;

  // 📊 SUMMARY
  console.log("\n════════════════════════════════════════════════════════════════════════════════════════════════════");
  console.log("📊 Test Summary");
  console.log("════════════════════════════════════════════════════════════════════════════════════════════════════");
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed === 0) {
    console.log("\n✅ All tests passed!");
    process.exit(0);
  } else {
    console.log(`\n❌ ${failed} test(s) failed`);
    process.exit(1);
  }
}

main().catch(console.error);
