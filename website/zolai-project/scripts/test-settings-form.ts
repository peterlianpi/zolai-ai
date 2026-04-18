import prisma from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const BASE_URL = "http://localhost:3000";
let testUserId = "";
let sessionCookie = "";
let csrfToken = "";
let fullCookie = "";
let passed = 0;
let failed = 0;

async function setupAuth() {
  const tempAuth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
  });
  const ctx = await tempAuth.$context;
  const hash = await ctx.password.hash("TestPass123!");

  testUserId = `test-form-${Date.now()}`;
  const email = `test-form-${Date.now()}@zolai.space`;

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      id: testUserId,
      email,
      name: "Test Form",
      emailVerified: true,
      role: "ADMIN",
    },
  });

  await prisma.account.upsert({
    where: { id: `${testUserId}_acc` },
    update: {},
    create: {
      id: `${testUserId}_acc`,
      accountId: email,
      providerId: "credential",
      userId: testUserId,
      password: hash,
    },
  });

  const signInRes = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "TestPass123!" }),
  });

  const sessionCookies = signInRes.headers.getSetCookie?.() || [];
  sessionCookie = sessionCookies.map((c) => c.split(";")[0]).join("; ");

  const csrfRes = await fetch(`${BASE_URL}/api/csrf-token`, {
    headers: { Cookie: sessionCookie },
  });

  const csrfData = await csrfRes.json();
  csrfToken = csrfData.token;
  const csrfCookies = csrfRes.headers.getSetCookie?.() || [];
  fullCookie = sessionCookie + "; " + csrfCookies.map((c) => c.split(";")[0]).join("; ");
}

async function cleanup() {
  await prisma.account.deleteMany({ where: { userId: testUserId } });
  await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
}

async function test(name: string, fn: () => Promise<boolean>) {
  try {
    const result = await fn();
    if (result) {
      console.log(`✓ ${name}`);
      passed++;
    } else {
      console.log(`✗ ${name}`);
      failed++;
    }
  } catch (err) {
    console.log(`✗ ${name} - ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

async function main() {
  console.log("╔════════════════════════════════════════════════════════════════════════════════════════════════════╗");
  console.log("║                    Settings Form Unit & Integration Tests                                        ║");
  console.log("╚════════════════════════════════════════════════════════════════════════════════════════════════════╝\n");

  console.log("🔧 Setting up test environment...\n");
  await setupAuth();

  // UNIT TESTS - Form Value Handling
  console.log("📝 Unit Tests - Form Value Handling");
  console.log("─".repeat(100));

  await test("String conversion preserves value", async () => {
    const value = "Test Site Name";
    const converted = String(value);
    return converted === value;
  });

  await test("String conversion handles empty string", async () => {
    const value = "";
    const converted = String(value);
    return converted === "";
  });

  await test("String conversion handles special characters", async () => {
    const value = "Test & <Site> \"Name\"";
    const converted = String(value);
    return converted === value;
  });

  await test("String conversion handles numbers", async () => {
    const value = "123";
    const converted = String(value);
    return converted === "123" && typeof converted === "string";
  });

  await test("String conversion handles undefined fallback", async () => {
    const value = undefined ?? "default";
    const converted = String(value);
    return converted === "default";
  });

  // INTEGRATION TESTS - API Calls
  console.log("\n🔗 Integration Tests - API Calls");
  console.log("─".repeat(100));

  await test("Update single setting with string key", async () => {
    const key = "site_name";
    const value = `Test Site ${Date.now()}`;
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Cookie: fullCookie,
      },
      body: JSON.stringify({ key: String(key), value: String(value) }),
    });
    return res.status === 200;
  });

  await test("Update setting with special characters", async () => {
    const key = "site_description";
    const value = `Test & <Description> "Special" 'Chars' ${Date.now()}`;
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Cookie: fullCookie,
      },
      body: JSON.stringify({ key: String(key), value: String(value) }),
    });
    return res.status === 200;
  });

  await test("Update setting with empty value", async () => {
    const key = "site_url";
    const value = "";
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Cookie: fullCookie,
      },
      body: JSON.stringify({ key: String(key), value: String(value) }),
    });
    return res.status === 200;
  });

  await test("Update setting with long value", async () => {
    const key = "site_description";
    const value = "A".repeat(500);
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Cookie: fullCookie,
      },
      body: JSON.stringify({ key: String(key), value: String(value) }),
    });
    return res.status === 200;
  });

  await test("Reject update without CSRF token", async () => {
    const key = "site_name";
    const value = "Test";
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: fullCookie,
      },
      body: JSON.stringify({ key: String(key), value: String(value) }),
    });
    return res.status === 403;
  });

  await test("Reject update without authentication", async () => {
    const key = "site_name";
    const value = "Test";
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ key: String(key), value: String(value) }),
    });
    return res.status === 401 || res.status === 403;
  });

  // BATCH TESTS - Multiple Updates
  console.log("\n📦 Batch Tests - Multiple Updates");
  console.log("─".repeat(100));

  await test("Batch update 3 settings sequentially", async () => {
    const settings = [
      { key: "site_name", value: `Batch Test ${Date.now()}` },
      { key: "site_description", value: "Batch Description" },
      { key: "noreply_email", value: "noreply@test.com" },
    ];

    for (const setting of settings) {
      const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          Cookie: fullCookie,
        },
        body: JSON.stringify({
          key: String(setting.key),
          value: String(setting.value),
        }),
      });
      if (res.status !== 200) return false;
    }
    return true;
  });

  await test("Batch update with mixed value types", async () => {
    const settings = [
      { key: "site_name", value: "String Value" },
      { key: "posts_per_page", value: "10" },
      { key: "allow_registration", value: "true" },
    ];

    for (const setting of settings) {
      const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          Cookie: fullCookie,
        },
        body: JSON.stringify({
          key: String(setting.key),
          value: String(setting.value),
        }),
      });
      if (res.status !== 200) return false;
    }
    return true;
  });

  // VALIDATION TESTS
  console.log("\n✔️  Validation Tests");
  console.log("─".repeat(100));

  await test("Reject undefined key", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Cookie: fullCookie,
      },
      body: JSON.stringify({ key: undefined, value: "test" }),
    });
    return res.status === 400;
  });

  await test("Reject undefined value", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Cookie: fullCookie,
      },
      body: JSON.stringify({ key: "site_name", value: undefined }),
    });
    return res.status === 400;
  });

  await test("Reject invalid key format", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Cookie: fullCookie,
      },
      body: JSON.stringify({ key: "", value: "test" }),
    });
    return res.status === 400;
  });

  // PERFORMANCE TESTS
  console.log("\n⚡ Performance Tests");
  console.log("─".repeat(100));

  await test("Update completes in < 500ms", async () => {
    const start = Date.now();
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Cookie: fullCookie,
      },
      body: JSON.stringify({
        key: String("site_name"),
        value: String(`Perf Test ${Date.now()}`),
      }),
    });
    const duration = Date.now() - start;
    return res.status === 200 && duration < 500;
  });

  await test("Batch update 5 settings in < 2s", async () => {
    const start = Date.now();
    const settings = [
      { key: "site_name", value: "Test" },
      { key: "site_description", value: "Test" },
      { key: "noreply_email", value: "test@test.com" },
      { key: "site_timezone", value: "UTC" },
      { key: "default_locale", value: "en" },
    ];

    for (const setting of settings) {
      const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          Cookie: fullCookie,
        },
        body: JSON.stringify({
          key: String(setting.key),
          value: String(setting.value),
        }),
      });
      if (res.status !== 200) return false;
    }

    const duration = Date.now() - start;
    return duration < 2000;
  });

  console.log("\n════════════════════════════════════════════════════════════════════════════════════════════════════");
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed (${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log("════════════════════════════════════════════════════════════════════════════════════════════════════");

  console.log("\n🧹 Cleaning up...");
  await cleanup();
  await prisma.$disconnect();

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
