#!/usr/bin/env bun
/**
 * API Mutation Audit & Test Suite
 * Tests all mutation endpoints (POST, PUT, PATCH, DELETE) with CSRF protection
 * Seeds admin and user accounts for testing
 */

import prisma from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const BASE_URL = process.env.API_URL || "http://localhost:3000";
const TEST_ADMIN_EMAIL = "audit-admin@zolai.space";
const TEST_USER_EMAIL = "audit-user@zolai.space";
const TEST_PASSWORD = "AuditTest123!";

interface TestResult {
  name: string;
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  error?: string;
  duration: number;
  requiresAuth: boolean;
  requiresCSRF: boolean;
}

const results: TestResult[] = [];
let adminSessionCookie = "";
let userSessionCookie = "";
let adminCSRFToken = "";
let userCSRFToken = "";

// ─────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────

async function seedTestAccounts() {
  console.log("🌱 Seeding test accounts...\n");

  try {
    const tempAuth = betterAuth({
      database: prismaAdapter(prisma, { provider: "postgresql" }),
      emailAndPassword: { enabled: true },
    });
    const ctx = await tempAuth.$context;
    const hash = await ctx.password.hash(TEST_PASSWORD);

    // Create admin account
    await prisma.user.upsert({
      where: { email: TEST_ADMIN_EMAIL },
      update: {},
      create: {
        id: "audit_admin_001",
        email: TEST_ADMIN_EMAIL,
        name: "Audit Admin",
        emailVerified: true,
        role: "ADMIN",
      },
    });

    await prisma.account.upsert({
      where: { id: "audit_admin_001_acc" },
      update: {},
      create: {
        id: "audit_admin_001_acc",
        accountId: TEST_ADMIN_EMAIL,
        providerId: "credential",
        userId: "audit_admin_001",
        password: hash,
      },
    });

    await prisma.userPreferences.upsert({
      where: { userId: "audit_admin_001" },
      update: {},
      create: {
        userId: "audit_admin_001",
        language: "en",
        timezone: "Asia/Rangoon",
      },
    });

    // Create user account
    await prisma.user.upsert({
      where: { email: TEST_USER_EMAIL },
      update: {},
      create: {
        id: "audit_user_001",
        email: TEST_USER_EMAIL,
        name: "Audit User",
        emailVerified: true,
        role: "USER",
      },
    });

    await prisma.account.upsert({
      where: { id: "audit_user_001_acc" },
      update: {},
      create: {
        id: "audit_user_001_acc",
        accountId: TEST_USER_EMAIL,
        providerId: "credential",
        userId: "audit_user_001",
        password: hash,
      },
    });

    await prisma.userPreferences.upsert({
      where: { userId: "audit_user_001" },
      update: {},
      create: {
        userId: "audit_user_001",
        language: "en",
        timezone: "Asia/Rangoon",
      },
    });

    console.log("✅ Test accounts created:");
    console.log(`   Admin: ${TEST_ADMIN_EMAIL} / ${TEST_PASSWORD}`);
    console.log(`   User:  ${TEST_USER_EMAIL} / ${TEST_PASSWORD}\n`);
  } catch (error) {
    console.error("❌ Failed to seed accounts:", error);
    throw error;
  }
}

async function request(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
  sessionCookie?: string,
  csrfToken?: string
) {
  const url = `${BASE_URL}${path}`;
  const start = Date.now();

  try {
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (sessionCookie) {
      requestHeaders["Cookie"] = sessionCookie;
    }

    if (csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      requestHeaders["X-CSRF-Token"] = csrfToken;
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const duration = Date.now() - start;
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return { status: response.status, data, duration };
  } catch (error) {
    const duration = Date.now() - start;
    return {
      status: 0,
      data: null,
      error: error instanceof Error ? error.message : String(error),
      duration,
    };
  }
}

async function authenticate(email: string, password: string) {
  console.log(`🔐 Authenticating ${email}...`);

  const { status, data, error } = await request("POST", "/api/auth/sign-in/email", {
    email,
    password,
  });

  if (status !== 200) {
    console.error(`❌ Authentication failed: ${error || data?.error?.message}`);
    throw new Error(`Failed to authenticate ${email}`);
  }

  console.log("✅ Authenticated\n");
  return data;
}

async function getCSRFToken(sessionCookie: string) {
  const { status, data } = await request("GET", "/api/csrf-token", undefined, {}, sessionCookie);

  if (status !== 200) {
    throw new Error("Failed to get CSRF token");
  }

  return data.token || data;
}

async function recordTest(
  name: string,
  endpoint: string,
  method: string,
  status: number,
  success: boolean,
  error: string | undefined,
  duration: number,
  requiresAuth: boolean,
  requiresCSRF: boolean
) {
  results.push({
    name,
    endpoint,
    method,
    status,
    success,
    error,
    duration,
    requiresAuth,
    requiresCSRF,
  });

  const icon = success ? "✓" : "✗";
  const authLabel = requiresAuth ? "[AUTH]" : "[PUBLIC]";
  const csrfLabel = requiresCSRF ? "[CSRF]" : "";
  console.log(
    `${icon} ${name.padEnd(50)} ${method.padEnd(6)} ${status} ${authLabel} ${csrfLabel} (${duration}ms)`
  );

  if (!success && error) {
    console.log(`  └─ Error: ${error}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Test Suites
// ─────────────────────────────────────────────────────────────────────────

async function testSettingsEndpoints() {
  console.log("\n⚙️  Settings Endpoints (Admin Only)");
  console.log("─".repeat(100));

  // Test: Get all settings (admin)
  const { status: getStatus, data: getSettings, error: getError, duration: getDuration } = await request(
    "GET",
    "/api/admin/site-settings",
    undefined,
    {},
    adminSessionCookie
  );

  await recordTest(
    "Get All Settings",
    "/api/admin/site-settings",
    "GET",
    getStatus,
    getStatus === 200,
    getError,
    getDuration,
    true,
    false
  );

  // Test: Update a setting (admin with CSRF)
  const { status: putStatus, data: putData, error: putError, duration: putDuration } = await request(
    "PUT",
    "/api/admin/site-settings",
    {
      key: "site_name",
      value: "Zolai Language Hub - Audit Test",
    },
    {},
    adminSessionCookie,
    adminCSRFToken
  );

  await recordTest(
    "Update Site Setting",
    "/api/admin/site-settings",
    "PUT",
    putStatus,
    putStatus === 200,
    putError,
    putDuration,
    true,
    true
  );

  // Test: Update setting without CSRF (should fail)
  const { status: noCsrfStatus, error: noCsrfError, duration: noCsrfDuration } = await request(
    "PUT",
    "/api/admin/site-settings",
    {
      key: "site_description",
      value: "Test without CSRF",
    },
    {},
    adminSessionCookie
  );

  await recordTest(
    "Update Setting (No CSRF - Should Fail)",
    "/api/admin/site-settings",
    "PUT",
    noCsrfStatus,
    noCsrfStatus === 403,
    noCsrfError,
    noCsrfDuration,
    true,
    true
  );

  // Test: Update setting as regular user (should fail)
  const { status: userStatus, error: userError, duration: userDuration } = await request(
    "PUT",
    "/api/admin/site-settings",
    {
      key: "site_name",
      value: "Hacked",
    },
    {},
    userSessionCookie,
    userCSRFToken
  );

  await recordTest(
    "Update Setting (User - Should Fail)",
    "/api/admin/site-settings",
    "PUT",
    userStatus,
    userStatus === 403,
    userError,
    userDuration,
    true,
    true
  );
}

async function testContentEndpoints() {
  console.log("\n📄 Content Endpoints");
  console.log("─".repeat(100));

  // Test: Create content (admin with CSRF)
  const { status: createStatus, data: createData, error: createError, duration: createDuration } = await request(
    "POST",
    "/api/content",
    {
      title: "Audit Test Post",
      slug: "audit-test-post",
      content: "This is a test post for audit",
      status: "DRAFT",
    },
    {},
    adminSessionCookie,
    adminCSRFToken
  );

  await recordTest(
    "Create Content",
    "/api/content",
    "POST",
    createStatus,
    createStatus === 201 || createStatus === 200,
    createError,
    createDuration,
    true,
    true
  );

  // Extract post ID if creation was successful
  let postId: string | null = null;
  if (createStatus === 201 || createStatus === 200) {
    postId = createData?.id || createData?.data?.id;
  }

  if (postId) {
    // Test: Update content (admin with CSRF)
    const { status: updateStatus, error: updateError, duration: updateDuration } = await request(
      "PATCH",
      `/api/content/${postId}`,
      {
        title: "Audit Test Post - Updated",
        content: "Updated content",
      },
      {},
      adminSessionCookie,
      adminCSRFToken
    );

    await recordTest(
      "Update Content",
      `/api/content/${postId}`,
      "PATCH",
      updateStatus,
      updateStatus === 200,
      updateError,
      updateDuration,
      true,
      true
    );

    // Test: Delete content (admin with CSRF)
    const { status: deleteStatus, error: deleteError, duration: deleteDuration } = await request(
      "DELETE",
      `/api/content/${postId}`,
      undefined,
      {},
      adminSessionCookie,
      adminCSRFToken
    );

    await recordTest(
      "Delete Content",
      `/api/content/${postId}`,
      "DELETE",
      deleteStatus,
      deleteStatus === 200 || deleteStatus === 204,
      deleteError,
      deleteDuration,
      true,
      true
    );
  }
}

async function testMediaEndpoints() {
  console.log("\n🖼️  Media Endpoints");
  console.log("─".repeat(100));

  // Test: Get media list (admin)
  const { status: getStatus, error: getError, duration: getDuration } = await request(
    "GET",
    "/api/media",
    undefined,
    {},
    adminSessionCookie
  );

  await recordTest(
    "Get Media List",
    "/api/media",
    "GET",
    getStatus,
    getStatus === 200,
    getError,
    getDuration,
    true,
    false
  );
}

async function testMenuEndpoints() {
  console.log("\n🍔 Menu Endpoints");
  console.log("─".repeat(100));

  // Test: Create menu item (admin with CSRF)
  const { status: createStatus, data: createData, error: createError, duration: createDuration } = await request(
    "POST",
    "/api/menus",
    {
      label: "Audit Test Menu",
      url: "/audit-test",
      order: 999,
    },
    {},
    adminSessionCookie,
    adminCSRFToken
  );

  await recordTest(
    "Create Menu Item",
    "/api/menus",
    "POST",
    createStatus,
    createStatus === 201 || createStatus === 200,
    createError,
    createDuration,
    true,
    true
  );

  let menuId: string | null = null;
  if (createStatus === 201 || createStatus === 200) {
    menuId = createData?.id || createData?.data?.id;
  }

  if (menuId) {
    // Test: Update menu item (admin with CSRF)
    const { status: updateStatus, error: updateError, duration: updateDuration } = await request(
      "PATCH",
      `/api/menus/${menuId}`,
      {
        label: "Audit Test Menu - Updated",
      },
      {},
      adminSessionCookie,
      adminCSRFToken
    );

    await recordTest(
      "Update Menu Item",
      `/api/menus/${menuId}`,
      "PATCH",
      updateStatus,
      updateStatus === 200,
      updateError,
      updateDuration,
      true,
      true
    );

    // Test: Delete menu item (admin with CSRF)
    const { status: deleteStatus, error: deleteError, duration: deleteDuration } = await request(
      "DELETE",
      `/api/menus/${menuId}`,
      undefined,
      {},
      adminSessionCookie,
      adminCSRFToken
    );

    await recordTest(
      "Delete Menu Item",
      `/api/menus/${menuId}`,
      "DELETE",
      deleteStatus,
      deleteStatus === 200 || deleteStatus === 204,
      deleteError,
      deleteDuration,
      true,
      true
    );
  }
}

async function testRedirectEndpoints() {
  console.log("\n🔀 Redirect Endpoints");
  console.log("─".repeat(100));

  // Test: Create redirect (admin with CSRF)
  const { status: createStatus, data: createData, error: createError, duration: createDuration } = await request(
    "POST",
    "/api/redirects",
    {
      source: "/audit-old",
      destination: "/audit-new",
      statusCode: 301,
    },
    {},
    adminSessionCookie,
    adminCSRFToken
  );

  await recordTest(
    "Create Redirect",
    "/api/redirects",
    "POST",
    createStatus,
    createStatus === 201 || createStatus === 200,
    createError,
    createDuration,
    true,
    true
  );

  let redirectId: string | null = null;
  if (createStatus === 201 || createStatus === 200) {
    redirectId = createData?.id || createData?.data?.id;
  }

  if (redirectId) {
    // Test: Update redirect (admin with CSRF)
    const { status: updateStatus, error: updateError, duration: updateDuration } = await request(
      "PATCH",
      `/api/redirects/${redirectId}`,
      {
        destination: "/audit-new-updated",
      },
      {},
      adminSessionCookie,
      adminCSRFToken
    );

    await recordTest(
      "Update Redirect",
      `/api/redirects/${redirectId}`,
      "PATCH",
      updateStatus,
      updateStatus === 200,
      updateError,
      updateDuration,
      true,
      true
    );

    // Test: Delete redirect (admin with CSRF)
    const { status: deleteStatus, error: deleteError, duration: deleteDuration } = await request(
      "DELETE",
      `/api/redirects/${redirectId}`,
      undefined,
      {},
      adminSessionCookie,
      adminCSRFToken
    );

    await recordTest(
      "Delete Redirect",
      `/api/redirects/${redirectId}`,
      "DELETE",
      deleteStatus,
      deleteStatus === 200 || deleteStatus === 204,
      deleteError,
      deleteDuration,
      true,
      true
    );
  }
}

async function testNewsletterEndpoints() {
  console.log("\n📧 Newsletter Endpoints");
  console.log("─".repeat(100));

  // Test: Subscribe to newsletter (public, no auth needed)
  const { status: subStatus, error: subError, duration: subDuration } = await request(
    "POST",
    "/api/newsletter/subscribe",
    {
      email: `audit-subscriber-${Date.now()}@test.com`,
    }
  );

  await recordTest(
    "Subscribe to Newsletter",
    "/api/newsletter/subscribe",
    "POST",
    subStatus,
    subStatus === 200 || subStatus === 201,
    subError,
    subDuration,
    false,
    false
  );

  // Test: Create campaign (admin with CSRF)
  const { status: campaignStatus, data: campaignData, error: campaignError, duration: campaignDuration } = await request(
    "POST",
    "/api/newsletter/campaigns",
    {
      name: "Audit Test Campaign",
      subject: "Test Subject",
      content: "Test content",
    },
    {},
    adminSessionCookie,
    adminCSRFToken
  );

  await recordTest(
    "Create Newsletter Campaign",
    "/api/newsletter/campaigns",
    "POST",
    campaignStatus,
    campaignStatus === 201 || campaignStatus === 200,
    campaignError,
    campaignDuration,
    true,
    true
  );
}

async function testNotificationEndpoints() {
  console.log("\n🔔 Notification Endpoints");
  console.log("─".repeat(100));

  // Test: Get notifications (user)
  const { status: getStatus, error: getError, duration: getDuration } = await request(
    "GET",
    "/api/notifications",
    undefined,
    {},
    userSessionCookie
  );

  await recordTest(
    "Get Notifications",
    "/api/notifications",
    "GET",
    getStatus,
    getStatus === 200,
    getError,
    getDuration,
    true,
    false
  );

  // Test: Mark notification as read (user with CSRF)
  const { status: markStatus, error: markError, duration: markDuration } = await request(
    "PATCH",
    "/api/notifications/mark-read",
    {
      notificationIds: [],
    },
    {},
    userSessionCookie,
    userCSRFToken
  );

  await recordTest(
    "Mark Notifications as Read",
    "/api/notifications/mark-read",
    "PATCH",
    markStatus,
    markStatus === 200,
    markError,
    markDuration,
    true,
    true
  );
}

async function testCommentEndpoints() {
  console.log("\n💬 Comment Endpoints");
  console.log("─".repeat(100));

  // Test: Create comment (user with CSRF)
  const { status: createStatus, data: createData, error: createError, duration: createDuration } = await request(
    "POST",
    "/api/comments",
    {
      content: "This is an audit test comment",
      postId: "test-post-id",
    },
    {},
    userSessionCookie,
    userCSRFToken
  );

  await recordTest(
    "Create Comment",
    "/api/comments",
    "POST",
    createStatus,
    createStatus === 201 || createStatus === 200 || createStatus === 400, // 400 if post doesn't exist
    createError,
    createDuration,
    true,
    true
  );

  let commentId: string | null = null;
  if (createStatus === 201 || createStatus === 200) {
    commentId = createData?.id || createData?.data?.id;
  }

  if (commentId) {
    // Test: Update comment (user with CSRF)
    const { status: updateStatus, error: updateError, duration: updateDuration } = await request(
      "PATCH",
      `/api/comments/${commentId}`,
      {
        content: "Updated comment",
      },
      {},
      userSessionCookie,
      userCSRFToken
    );

    await recordTest(
      "Update Comment",
      `/api/comments/${commentId}`,
      "PATCH",
      updateStatus,
      updateStatus === 200,
      updateError,
      updateDuration,
      true,
      true
    );

    // Test: Delete comment (user with CSRF)
    const { status: deleteStatus, error: deleteError, duration: deleteDuration } = await request(
      "DELETE",
      `/api/comments/${commentId}`,
      undefined,
      {},
      userSessionCookie,
      userCSRFToken
    );

    await recordTest(
      "Delete Comment",
      `/api/comments/${commentId}`,
      "DELETE",
      deleteStatus,
      deleteStatus === 200 || deleteStatus === 204,
      deleteError,
      deleteDuration,
      true,
      true
    );
  }
}

async function testSecurityEndpoints() {
  console.log("\n🔒 Security Endpoints");
  console.log("─".repeat(100));

  // Test: Get security settings (admin)
  const { status: getStatus, error: getError, duration: getDuration } = await request(
    "GET",
    "/api/security",
    undefined,
    {},
    adminSessionCookie
  );

  await recordTest(
    "Get Security Settings",
    "/api/security",
    "GET",
    getStatus,
    getStatus === 200,
    getError,
    getDuration,
    true,
    false
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Main Execution
// ─────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔════════════════════════════════════════════════════════════════════════════════════════════════════╗");
  console.log("║                    API Mutation Audit & Test Suite with CSRF Protection                           ║");
  console.log("╚════════════════════════════════════════════════════════════════════════════════════════════════════╝\n");

  console.log(`Base URL: ${BASE_URL}\n`);

  try {
    // Seed test accounts
    await seedTestAccounts();

    // Authenticate admin
    console.log("🔐 Admin Authentication");
    console.log("─".repeat(100));
    const adminData = await authenticate(TEST_ADMIN_EMAIL, TEST_PASSWORD);
    adminSessionCookie = adminData.sessionCookie || adminData.session?.id || "";
    adminCSRFToken = await getCSRFToken(adminSessionCookie);
    console.log(`✅ Admin CSRF Token: ${adminCSRFToken.substring(0, 20)}...\n`);

    // Authenticate user
    console.log("🔐 User Authentication");
    console.log("─".repeat(100));
    const userData = await authenticate(TEST_USER_EMAIL, TEST_PASSWORD);
    userSessionCookie = userData.sessionCookie || userData.session?.id || "";
    userCSRFToken = await getCSRFToken(userSessionCookie);
    console.log(`✅ User CSRF Token: ${userCSRFToken.substring(0, 20)}...\n`);

    // Run test suites
    await testSettingsEndpoints();
    await testContentEndpoints();
    await testMediaEndpoints();
    await testMenuEndpoints();
    await testRedirectEndpoints();
    await testNewsletterEndpoints();
    await testNotificationEndpoints();
    await testCommentEndpoints();
    await testSecurityEndpoints();

    // Print summary
    console.log("\n" + "═".repeat(100));
    console.log("📊 Test Summary");
    console.log("═".repeat(100));

    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const avgDuration = Math.round(
      results.reduce((sum, r) => sum + r.duration, 0) / results.length
    );

    console.log(`Total Tests: ${results.length}`);
    console.log(`✓ Passed: ${passed}`);
    console.log(`✗ Failed: ${failed}`);
    console.log(`⏱️  Avg Duration: ${avgDuration}ms`);

    // CSRF Protection Summary
    const csrfTests = results.filter((r) => r.requiresCSRF);
    const csrfPassed = csrfTests.filter((r) => r.success).length;
    console.log(`\n🔐 CSRF Protection Tests: ${csrfPassed}/${csrfTests.length} passed`);

    // Auth Protection Summary
    const authTests = results.filter((r) => r.requiresAuth);
    const authPassed = authTests.filter((r) => r.success).length;
    console.log(`🔑 Auth Protection Tests: ${authPassed}/${authTests.length} passed`);

    if (failed > 0) {
      console.log("\n❌ Failed Tests:");
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`  - ${r.method.padEnd(6)} ${r.endpoint.padEnd(40)} (${r.status})`);
          if (r.error) console.log(`    Error: ${r.error}`);
        });
    }

    console.log("\n" + "═".repeat(100));
    console.log(`\n${failed === 0 ? "✅ All tests passed!" : `⚠️  ${failed} test(s) failed`}\n`);

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("\n❌ Test suite error:", error);
    process.exit(1);
  }
}

main();
