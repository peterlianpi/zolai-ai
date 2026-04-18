#!/usr/bin/env bun
/**
 * Backend API Test Suite
 * Tests backend functionality, security, and data integrity
 */

import prisma from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const BASE_URL = process.env.API_URL || "http://localhost:3000";
const TEST_EMAIL = "backend-test@zolai.space";
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
        id: "backend_test_001",
        email: TEST_EMAIL,
        name: "Backend Test",
        emailVerified: true,
        role: "ADMIN",
      },
    });

    await prisma.account.upsert({
      where: { id: "backend_test_001_acc" },
      update: {},
      create: {
        id: "backend_test_001_acc",
        accountId: TEST_EMAIL,
        providerId: "credential",
        userId: "backend_test_001",
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
  console.log("║                         Backend API Test Suite                                                   ║");
  console.log("╚════════════════════════════════════════════════════════════════════════════════════════════════════╝\n");

  await seedAccount();
  const cookie = await authenticate(TEST_EMAIL);
  const csrfData = await getCSRFToken(cookie);
  const fullCookie = cookie + (csrfData.cookie ? "; " + csrfData.cookie.split(";")[0] : "");

  // DATABASE OPERATIONS
  console.log("\n📊 Database Operations");
  console.log("─".repeat(100));

  await test("Create site setting", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: fullCookie,
        "X-CSRF-Token": csrfData.token,
      },
      body: JSON.stringify({ key: "test_key_" + Date.now(), value: "test_value" }),
    });
    return res.status === 200;
  });

  await test("Read site settings", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      headers: { Cookie: fullCookie },
    });
    if (res.status !== 200) return false;
    const data = await res.json();
    return Array.isArray(data) || (data && typeof data === "object");
  });

  await test("Create menu", async () => {
    const res = await fetch(`${BASE_URL}/api/menus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: fullCookie,
        "X-CSRF-Token": csrfData.token,
      },
      body: JSON.stringify({ name: "Test Menu", slug: "test-menu-" + Date.now() }),
    });
    return res.status === 201;
  });

  await test("Create redirect", async () => {
    const res = await fetch(`${BASE_URL}/api/redirects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: fullCookie,
        "X-CSRF-Token": csrfData.token,
      },
      body: JSON.stringify({
        source: "/old-" + Date.now(),
        destination: "/new",
        statusCode: 301,
      }),
    });
    return res.status === 201;
  });

  // API RESPONSE VALIDATION
  console.log("\n📋 API Response Validation");
  console.log("─".repeat(100));

  await test("Response has correct Content-Type", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const contentType = res.headers.get("content-type");
    return contentType?.includes("application/json") || false;
  });

  await test("Error responses have error field", async () => {
    const res = await fetch(`${BASE_URL}/api/profile`);
    const data = await res.json();
    return res.status === 401 && data.error;
  });

  await test("Success responses have data", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    return res.status === 200 && data;
  });

  // AUTHENTICATION & AUTHORIZATION
  console.log("\n🔐 Authentication & Authorization");
  console.log("─".repeat(100));

  await test("Unauthenticated user cannot access protected endpoint", async () => {
    const res = await fetch(`${BASE_URL}/api/profile`);
    return res.status === 401;
  });

  await test("Authenticated user can access profile", async () => {
    const res = await fetch(`${BASE_URL}/api/profile`, { headers: { Cookie: fullCookie } });
    return res.status === 200;
  });

  await test("Admin can access admin endpoints", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, { headers: { Cookie: fullCookie } });
    return res.status === 200;
  });

  // DATA VALIDATION
  console.log("\n✔️  Data Validation");
  console.log("─".repeat(100));

  await test("Invalid email is rejected", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email", password: "test" }),
    });
    return res.status !== 200;
  });

  await test("Missing required fields are rejected", async () => {
    const res = await fetch(`${BASE_URL}/api/menus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: fullCookie,
        "X-CSRF-Token": csrfData.token,
      },
      body: JSON.stringify({ name: "Test" }),
    });
    return res.status === 400;
  });

  // PERFORMANCE
  console.log("\n⚡ Performance");
  console.log("─".repeat(100));

  await test("Health check responds in < 100ms", async () => {
    const start = Date.now();
    await fetch(`${BASE_URL}/api/health`);
    return Date.now() - start < 100;
  });

  await test("API endpoints respond in < 500ms", async () => {
    const start = Date.now();
    await fetch(`${BASE_URL}/api/admin/stats`, { headers: { Cookie: fullCookie } });
    return Date.now() - start < 500;
  });

  // DATABASE INTEGRITY
  console.log("\n🔒 Database Integrity");
  console.log("─".repeat(100));

  await test("User data is properly stored", async () => {
    const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
    return !!user && user.role === "ADMIN";
  });

  await test("Passwords are hashed", async () => {
    const account = await prisma.account.findFirst({
      where: { userId: "backend_test_001" },
    });
    return !!account?.password && account.password.length > 20;
  });

  // SUMMARY
  console.log("\n════════════════════════════════════════════════════════════════════════════════════════════════════");
  console.log("📊 Backend Test Summary");
  console.log("════════════════════════════════════════════════════════════════════════════════════════════════════");
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log("\n✅ All backend tests passed!");
    process.exit(0);
  } else {
    console.log(`\n❌ ${failed} test(s) failed`);
    process.exit(1);
  }
}

main().catch(console.error);
