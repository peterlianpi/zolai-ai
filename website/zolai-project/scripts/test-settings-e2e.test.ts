import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import prisma from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const BASE_URL = "http://localhost:3000";
let testUserId = "";
let sessionCookie = "";
let csrfToken = "";
let fullCookie = "";

async function setupAuth() {
  const tempAuth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
  });
  const ctx = await tempAuth.$context;
  const hash = await ctx.password.hash("TestPass123!");

  testUserId = `test-e2e-${Date.now()}`;
  const email = `test-e2e-${Date.now()}@zolai.space`;

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      id: testUserId,
      email,
      name: "Test E2E",
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

describe("Settings Form - E2E Tests", () => {
  beforeAll(async () => {
    await setupAuth();
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it("should update single setting successfully", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Cookie: fullCookie,
      },
      body: JSON.stringify({
        key: String("site_name"),
        value: String(`E2E Test ${Date.now()}`),
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("should update multiple settings in sequence", async () => {
    const settings = [
      { key: "site_name", value: "E2E Site" },
      { key: "site_description", value: "E2E Description" },
      { key: "noreply_email", value: "e2e@test.com" },
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

      expect(res.status).toBe(200);
    }
  });

  it("should handle special characters in settings", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Cookie: fullCookie,
      },
      body: JSON.stringify({
        key: String("site_description"),
        value: String('Test & <Description> "Special" \'Chars\''),
      }),
    });

    expect(res.status).toBe(200);
  });

  it("should reject update without CSRF token", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: fullCookie,
      },
      body: JSON.stringify({
        key: String("site_name"),
        value: String("Test"),
      }),
    });

    expect(res.status).toBe(403);
  });

  it("should reject update without authentication", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({
        key: String("site_name"),
        value: String("Test"),
      }),
    });

    expect(res.status === 401 || res.status === 403).toBe(true);
  });

  it("should handle empty value update", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Cookie: fullCookie,
      },
      body: JSON.stringify({
        key: String("site_url"),
        value: String(""),
      }),
    });

    expect(res.status).toBe(200);
  });

  it("should handle long value update", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Cookie: fullCookie,
      },
      body: JSON.stringify({
        key: String("site_description"),
        value: String("A".repeat(500)),
      }),
    });

    expect(res.status).toBe(200);
  });

  it("should complete update within performance threshold", async () => {
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

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(500);
  });

  it("should handle batch updates efficiently", async () => {
    const start = Date.now();
    const settings = [
      { key: "site_name", value: "Batch" },
      { key: "site_description", value: "Batch Desc" },
      { key: "noreply_email", value: "batch@test.com" },
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

      expect(res.status).toBe(200);
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  it("should reject invalid key format", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/site-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        Cookie: fullCookie,
      },
      body: JSON.stringify({
        key: String(""),
        value: String("test"),
      }),
    });

    expect(res.status).toBe(400);
  });

  it("should handle concurrent updates", async () => {
    const promises = [
      fetch(`${BASE_URL}/api/admin/site-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          Cookie: fullCookie,
        },
        body: JSON.stringify({
          key: String("site_name"),
          value: String("Concurrent 1"),
        }),
      }),
      fetch(`${BASE_URL}/api/admin/site-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          Cookie: fullCookie,
        },
        body: JSON.stringify({
          key: String("site_description"),
          value: String("Concurrent 2"),
        }),
      }),
      fetch(`${BASE_URL}/api/admin/site-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          Cookie: fullCookie,
        },
        body: JSON.stringify({
          key: String("noreply_email"),
          value: String("concurrent@test.com"),
        }),
      }),
    ];

    const results = await Promise.all(promises);
    expect(results.every((r) => r.status === 200)).toBe(true);
  });
});
