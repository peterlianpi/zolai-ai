#!/usr/bin/env bun
/**
 * Role-Based Access Control (RBAC) Test Suite
 * Validates authorization on all endpoints
 */

import prisma from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const BASE_URL = process.env.API_URL || "http://localhost:3000";
const ADMIN_EMAIL = "rbac-admin@zolai.space";
const USER_EMAIL = "rbac-user@zolai.space";
const GUEST_EMAIL = "rbac-guest@zolai.space";
const PASSWORD = "TestPass123!";

let adminCookie = "";
let userCookie = "";
let guestCookie = "";
let adminCSRF = "";
let userCSRF = "";
let guestCSRF = "";
let passed = 0;
let failed = 0;

async function seedAccounts() {
  try {
    const tempAuth = betterAuth({
      database: prismaAdapter(prisma, { provider: "postgresql" }),
      emailAndPassword: { enabled: true },
    });
    const ctx = await tempAuth.$context;
    const hash = await ctx.password.hash(PASSWORD);

    // Admin
    await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {},
      create: {
        id: "rbac_admin_001",
        email: ADMIN_EMAIL,
        name: "RBAC Admin",
        emailVerified: true,
        role: "ADMIN",
      },
    });

    await prisma.account.upsert({
      where: { id: "rbac_admin_001_acc" },
      update: {},
      create: {
        id: "rbac_admin_001_acc",
        accountId: ADMIN_EMAIL,
        providerId: "credential",
        userId: "rbac_admin_001",
        password: hash,
      },
    });

    // User
    await prisma.user.upsert({
      where: { email: USER_EMAIL },
      update: {},
      create: {
        id: "rbac_user_001",
        email: USER_EMAIL,
        name: "RBAC User",
        emailVerified: true,
        role: "USER",
      },
    });

    await prisma.account.upsert({
      where: { id: "rbac_user_001_acc" },
      update: {},
      create: {
        id: "rbac_user_001_acc",
        accountId: USER_EMAIL,
        providerId: "credential",
        userId: "rbac_user_001",
        password: hash,
      },
    });

    // Guest (no role)
    await prisma.user.upsert({
      where: { email: GUEST_EMAIL },
      update: {},
      create: {
        id: "rbac_guest_001",
        email: GUEST_EMAIL,
        name: "RBAC Guest",
        emailVerified: true,
        role: "USER",
      },
    });

    await prisma.account.upsert({
      where: { id: "rbac_guest_001_acc" },
      update: {},
      create: {
        id: "rbac_guest_001_acc",
        accountId: GUEST_EMAIL,
        providerId: "credential",
        userId: "rbac_guest_001",
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
    body: JSON.stringify({ email, password: PASSWORD }),
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

async function test(name: string, method: string, path: string, expectedStatus: number, body?: unknown, cookie?: string, csrf?: string) {
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

    const success = res.status === expectedStatus;
    const icon = success ? "✓" : "✗";

    console.log(`${icon} ${name.padEnd(50)} ${method.padEnd(6)} ${res.status} (expected ${expectedStatus})`);
    return success;
  } catch (error) {
    console.log(`✗ ${name.padEnd(50)} ${method.padEnd(6)} ERROR`);
    return false;
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════════════════════════════════════════════╗");
  console.log("║                    Role-Based Access Control (RBAC) Test Suite                                   ║");
  console.log("╚════════════════════════════════════════════════════════════════════════════════════════════════════╝\n");

  await seedAccounts();

  console.log("🔐 Authenticating...");
  adminCookie = await authenticate(ADMIN_EMAIL);
  userCookie = await authenticate(USER_EMAIL);
  guestCookie = await authenticate(GUEST_EMAIL);

  console.log("🔑 Getting CSRF tokens...");
  const adminCSRFData = await getCSRFToken(adminCookie);
  const userCSRFData = await getCSRFToken(userCookie);
  const guestCSRFData = await getCSRFToken(guestCookie);
  adminCSRF = adminCSRFData.token;
  userCSRF = userCSRFData.token;
  guestCSRF = guestCSRFData.token;
  if (adminCSRFData.cookie) adminCookie += "; " + adminCSRFData.cookie.split(";")[0];
  if (userCSRFData.cookie) userCookie += "; " + userCSRFData.cookie.split(";")[0];
  if (guestCSRFData.cookie) guestCookie += "; " + guestCSRFData.cookie.split(";")[0];

  // ADMIN-ONLY ENDPOINTS
  console.log("\n👨‍💼 Admin-Only Endpoints (Should be 200 for admin, 403 for user/guest)");
  console.log("─".repeat(100));

  let result = await test("Admin Stats (Admin)", "GET", "/api/admin/stats", 200, undefined, adminCookie);
  result ? passed++ : failed++;

  result = await test("Admin Stats (User)", "GET", "/api/admin/stats", 403, undefined, userCookie);
  result ? passed++ : failed++;

  result = await test("Admin Stats (Guest)", "GET", "/api/admin/stats", 403, undefined, guestCookie);
  result ? passed++ : failed++;

  result = await test("Admin Analytics (Admin)", "GET", "/api/admin/analytics", 200, undefined, adminCookie);
  result ? passed++ : failed++;

  result = await test("Admin Analytics (User)", "GET", "/api/admin/analytics", 403, undefined, userCookie);
  result ? passed++ : failed++;

  result = await test("Update Settings (Admin)", "PUT", "/api/admin/site-settings",
    200, { key: "test_" + Date.now(), value: "test" }, adminCookie, adminCSRF);
  result ? passed++ : failed++;

  result = await test("Update Settings (User)", "PUT", "/api/admin/site-settings",
    403, { key: "test", value: "test" }, userCookie, userCSRF);
  result ? passed++ : failed++;

  result = await test("Create Menu (Admin)", "POST", "/api/menus",
    201, { name: "Test", slug: "test-" + Date.now() }, adminCookie, adminCSRF);
  result ? passed++ : failed++;

  result = await test("Create Menu (User)", "POST", "/api/menus",
    403, { name: "Test", slug: "test" }, userCookie, userCSRF);
  result ? passed++ : failed++;

  result = await test("Create Redirect (Admin)", "POST", "/api/redirects",
    201, { source: "/old-" + Date.now(), destination: "/new", statusCode: 301 }, adminCookie, adminCSRF);
  result ? passed++ : failed++;

  result = await test("Create Redirect (User)", "POST", "/api/redirects",
    403, { source: "/old", destination: "/new", statusCode: 301 }, userCookie, userCSRF);
  result ? passed++ : failed++;

  // USER ENDPOINTS
  console.log("\n👤 User Endpoints (Should be 200 for authenticated users)");
  console.log("─".repeat(100));

  result = await test("Get Profile (User)", "GET", "/api/profile", 200, undefined, userCookie);
  result ? passed++ : failed++;

  result = await test("Get Profile (Guest)", "GET", "/api/profile", 200, undefined, guestCookie);
  result ? passed++ : failed++;

  result = await test("Get Preferences (User)", "GET", "/api/preferences", 200, undefined, userCookie);
  result ? passed++ : failed++;

  result = await test("Get Notifications (User)", "GET", "/api/notifications", 200, undefined, userCookie);
  result ? passed++ : failed++;

  result = await test("Get Comments (User)", "GET", "/api/comments", 200, undefined, userCookie);
  result ? passed++ : failed++;

  // PUBLIC ENDPOINTS
  console.log("\n🌐 Public Endpoints (Should be 200 for all)");
  console.log("─".repeat(100));

  result = await test("Health Check (No Auth)", "GET", "/api/health", 200);
  result ? passed++ : failed++;

  result = await test("CSRF Token (No Auth)", "GET", "/api/csrf-token", 200);
  result ? passed++ : failed++;

  result = await test("Sign In", "POST", "/api/auth/sign-in/email", 200,
    { email: ADMIN_EMAIL, password: PASSWORD });
  result ? passed++ : failed++;

  // UNAUTHENTICATED ACCESS
  console.log("\n🔒 Unauthenticated Access (Should be 401)");
  console.log("─".repeat(100));

  result = await test("Get Profile (No Auth)", "GET", "/api/profile", 401);
  result ? passed++ : failed++;

  result = await test("Get Preferences (No Auth)", "GET", "/api/preferences", 401);
  result ? passed++ : failed++;

  result = await test("Get Notifications (No Auth)", "GET", "/api/notifications", 401);
  result ? passed++ : failed++;

  result = await test("Admin Stats (No Auth)", "GET", "/api/admin/stats", 401);
  result ? passed++ : failed++;

  // SUMMARY
  console.log("\n════════════════════════════════════════════════════════════════════════════════════════════════════");
  console.log("📊 RBAC Test Summary");
  console.log("════════════════════════════════════════════════════════════════════════════════════════════════════");
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log("\n✅ All RBAC tests passed!");
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed`);
    process.exit(1);
  }
}

main().catch(console.error);
