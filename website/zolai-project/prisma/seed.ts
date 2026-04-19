import prisma from "../lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_SHORT_NAME,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_URL,
  DEFAULT_SITE_CREATOR,
  DEFAULT_TWITTER_HANDLE,
  DEFAULT_TIMEZONE,
  DEFAULT_FOOTER_COPYRIGHT_TEXT,
  DEFAULT_CONTACT_EMAIL,
  DEFAULT_SUPPORT_EMAIL,
  DEFAULT_ADMIN_EMAIL,
} from "../lib/constants/site";

async function main() {
  console.log("🌱 Starting Zolai AI seed...\n");

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log("🔄 Creating users...");
  const tempAuth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
  });
  const ctx = await tempAuth.$context;
  const hash = await ctx.password.hash("Password123!");

  const testUsers = [
    { id: "admin_zolai_001",   email: "admin@zolai.space",     name: "Zolai Admin",     role: "SUPER_ADMIN"   },
    { id: "user_admin",         email: "admin2@zolai.space",    name: "Admin",           role: "ADMIN"         },
    { id: "user_content_admin", email: "content@zolai.space",   name: "Content Manager", role: "CONTENT_ADMIN" },
    { id: "user_moderator",     email: "moderator@zolai.space", name: "Moderator",       role: "MODERATOR"     },
    { id: "user_regular",       email: "user@zolai.space",      name: "Regular User",    role: "USER"          },
  ];

  for (const u of testUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { id: u.id, email: u.email, name: u.name, emailVerified: true, role: u.role as never },
    });
    await prisma.account.upsert({
      where: { id: `${u.id}_acc` },
      update: {},
      create: { id: `${u.id}_acc`, accountId: u.email, providerId: "credential", userId: u.id, password: hash },
    });
    await prisma.userPreferences.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, language: "en", timezone: "Asia/Rangoon" },
    });
  }
  console.log("  ✅ Users created (all password: Password123!)");

  // ── Site Settings ──────────────────────────────────────────────────────────
  console.log("🔄 Creating site settings...");
  const siteSettings = [
    { key: "site_name", value: DEFAULT_SITE_NAME },
    { key: "site_short_name", value: DEFAULT_SITE_SHORT_NAME },
    { key: "site_description", value: DEFAULT_SITE_DESCRIPTION },
    { key: "site_url", value: DEFAULT_SITE_URL },
    { key: "site_creator", value: DEFAULT_SITE_CREATOR },
    { key: "site_publisher", value: DEFAULT_SITE_NAME },
    { key: "site_timezone", value: DEFAULT_TIMEZONE },
    { key: "twitter_handle", value: DEFAULT_TWITTER_HANDLE },
    { key: "seo_default_title", value: `${DEFAULT_SITE_NAME} — The Zolai Second Brain` },
    { key: "seo_default_description", value: "Learn, explore, and interact with the Zolai language powered by AI." },
    { key: "seo_keywords", value: JSON.stringify(["Zolai", "Tedim", "Zomi", "language AI", "Zolai second brain", "Tedim dictionary", "Zomi language"]) },
    { key: "og_image", value: "/og.png" },
    { key: "favicon", value: "/favicon.ico" },
    { key: "geo_region", value: "MM" },
    { key: "geo_placename", value: "Myanmar" },
    { key: "comments_enabled", value: "true" },
    { key: "posts_per_page", value: "10" },
    { key: "footer_copyright_text", value: DEFAULT_FOOTER_COPYRIGHT_TEXT },
    { key: "contact_email",         value: DEFAULT_CONTACT_EMAIL },
    { key: "support_email",         value: DEFAULT_SUPPORT_EMAIL },
    { key: "admin_email",           value: DEFAULT_ADMIN_EMAIL },
  ];
  for (const s of siteSettings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }
  console.log("  ✅ Site settings created");

  // ── Dataset Stats ──────────────────────────────────────────────────────────
  console.log("🔄 Creating dataset stats...");
  const datasetStats = [
    { label: "sentences",    value: 4574492, target: 5000000, unit: "records" },
    { label: "parallel",     value: 156147,  target: 200000,  unit: "pairs"   },
    { label: "instructions", value: 1127,    target: 10000,   unit: "records" },
    { label: "dictionary",   value: 159027,  target: 200000,  unit: "entries" },
  ];
  for (const stat of datasetStats) {
    await prisma.datasetStat.upsert({ where: { label: stat.label }, update: stat, create: stat });
  }
  console.log("  ✅ Dataset stats created");

  // ── Training Runs ──────────────────────────────────────────────────────────
  console.log("🔄 Creating training runs...");
  const trainingRuns = [
    {
      name: "qwen_zolai_7b_lora_v7",
      model: "Qwen2.5-7B",
      status: "complete",
      steps: 100,
      startedAt: new Date("2025-11-01T00:00:00Z"),
      endedAt: new Date("2025-11-02T06:00:00Z"),
    },
    {
      name: "zolai_v1",
      model: "Qwen2.5-3B",
      status: "complete",
      steps: 500,
      startedAt: new Date("2026-01-10T00:00:00Z"),
      endedAt: new Date("2026-01-12T18:00:00Z"),
    },
  ];
  for (const run of trainingRuns) {
    await prisma.trainingRun.upsert({
      where: { id: `run_${run.name}` },
      update: run,
      create: { id: `run_${run.name}`, ...run },
    });
  }
  console.log("  ✅ Training runs created");

  // ── Notification Templates ─────────────────────────────────────────────────
  console.log("🔄 Creating notification templates...");
  const notifTemplates = [
    {
      slug: "training-run-complete",
      name: "Training Run Complete",
      subject: "Training run {{name}} completed",
      body: "Your training run <strong>{{name}}</strong> on model {{model}} has completed after {{steps}} steps.",
      type: "training",
      variables: { name: "string", model: "string", steps: "number" },
    },
    {
      slug: "training-run-failed",
      name: "Training Run Failed",
      subject: "Training run {{name}} failed",
      body: "Your training run <strong>{{name}}</strong> has failed. Please check the logs for details.",
      type: "training",
      variables: { name: "string" },
    },
    {
      slug: "dataset-milestone",
      name: "Dataset Milestone Reached",
      subject: "Dataset milestone: {{name}} reached {{count}} entries",
      body: "The <strong>{{name}}</strong> dataset has reached {{count}} entries (target: {{target}}).",
      type: "dataset",
      variables: { name: "string", count: "number", target: "number" },
    },
    {
      slug: "wiki-needs-review",
      name: "Wiki Entry Needs Review",
      subject: "Wiki entry '{{title}}' needs review",
      body: "A wiki entry titled <strong>{{title}}</strong> in category {{category}} has been flagged for review.",
      type: "wiki",
      variables: { title: "string", category: "string" },
    },
    {
      slug: "welcome",
      name: "Welcome to Zolai AI",
      subject: "Welcome to Zolai AI, {{name}}!",
      body: "Ka lawm e, {{name}}! Welcome to the Zolai AI Second Brain. Start exploring the Zolai language today.",
      type: "auth",
      variables: { name: "string" },
    },
  ];
  for (const t of notifTemplates) {
    await prisma.notificationTemplate.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
  }
  console.log("  ✅ Notification templates created");

  // ── Audit Logs (role changes + other actions) ─────────────────────────────
  console.log("🔄 Creating audit logs...");
  const now = new Date();
  const auditEntries = [
    // Role changes (last 30 days) — these power the role management metrics
    { id: "audit_001", action: "UPDATE", entityType: "User", entityId: "user_regular",       oldValues: { role: "USER" },          newValues: { role: "CONTRIBUTOR" },   createdById: "user_admin",         createdAt: new Date(now.getTime() - 2  * 86400000) },
    { id: "audit_002", action: "UPDATE", entityType: "User", entityId: "user_content_admin", oldValues: { role: "EDITOR" },         newValues: { role: "CONTENT_ADMIN" }, createdById: "admin_zolai_001",    createdAt: new Date(now.getTime() - 5  * 86400000) },
    { id: "audit_003", action: "UPDATE", entityType: "User", entityId: "user_moderator",     oldValues: { role: "CONTRIBUTOR" },    newValues: { role: "MODERATOR" },     createdById: "admin_zolai_001",    createdAt: new Date(now.getTime() - 8  * 86400000) },
    { id: "audit_004", action: "UPDATE", entityType: "User", entityId: "user_admin",         oldValues: { role: "MODERATOR" },      newValues: { role: "ADMIN" },         createdById: "admin_zolai_001",    createdAt: new Date(now.getTime() - 12 * 86400000) },
    { id: "audit_005", action: "UPDATE", entityType: "User", entityId: "user_regular",       oldValues: { role: "CONTRIBUTOR" },    newValues: { role: "AUTHOR" },        createdById: "user_admin",         createdAt: new Date(now.getTime() - 15 * 86400000) },
    // Other audit actions
    { id: "audit_006", action: "CREATE", entityType: "Post",    entityId: "post_001", oldValues: null, newValues: { title: "Introduction to Zolai" }, createdById: "user_content_admin", createdAt: new Date(now.getTime() - 3  * 86400000) },
    { id: "audit_007", action: "PUBLISH", entityType: "Post",   entityId: "post_001", oldValues: { status: "DRAFT" }, newValues: { status: "PUBLISHED" }, createdById: "user_admin", createdAt: new Date(now.getTime() - 2  * 86400000) },
    { id: "audit_008", action: "DELETE",  entityType: "Comment", entityId: "cmt_001", oldValues: { content: "spam" }, newValues: null, createdById: "user_moderator", createdAt: new Date(now.getTime() - 1  * 86400000) },
    { id: "audit_009", action: "LOGIN",   entityType: "User",   entityId: "admin_zolai_001", oldValues: null, newValues: null, createdById: "admin_zolai_001", createdAt: new Date(now.getTime() - 1  * 86400000) },
    { id: "audit_010", action: "UPDATE",  entityType: "SiteSetting", entityId: "site_name", oldValues: { value: "Old Name" }, newValues: { value: DEFAULT_SITE_NAME }, createdById: "admin_zolai_001", createdAt: new Date(now.getTime() - 6  * 86400000) },
  ];
  for (const a of auditEntries) {
    await prisma.auditLog.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, action: a.action as never },
    });
  }
  console.log("  ✅ Audit logs created");

  // ── Login History ──────────────────────────────────────────────────────────
  console.log("🔄 Creating login history...");
  const loginHistoryEntries = [
    { id: "lh_001", userId: "admin_zolai_001", ipAddress: "192.168.1.1",  deviceName: "Chrome on Windows", deviceType: "desktop", osName: "Windows", browserName: "Chrome", country: "MM", city: "Yangon",    isCurrentSession: true,  createdAt: new Date(now.getTime() - 1  * 3600000) },
    { id: "lh_002", userId: "admin_zolai_001", ipAddress: "192.168.1.1",  deviceName: "Chrome on Windows", deviceType: "desktop", osName: "Windows", browserName: "Chrome", country: "MM", city: "Yangon",    isCurrentSession: false, createdAt: new Date(now.getTime() - 25 * 3600000) },
    { id: "lh_003", userId: "user_admin",       ipAddress: "10.0.0.5",     deviceName: "Safari on macOS",   deviceType: "desktop", osName: "macOS",   browserName: "Safari", country: "SG", city: "Singapore", isCurrentSession: true,  createdAt: new Date(now.getTime() - 2  * 3600000) },
    { id: "lh_004", userId: "user_regular",     ipAddress: "203.0.113.10", deviceName: "Chrome on Android", deviceType: "mobile",  osName: "Android", browserName: "Chrome", country: "MM", city: "Mandalay",  isCurrentSession: true,  createdAt: new Date(now.getTime() - 4  * 3600000) },
    { id: "lh_005", userId: "user_moderator",   ipAddress: "198.51.100.5", deviceName: "Firefox on Linux",  deviceType: "desktop", osName: "Linux",   browserName: "Firefox",country: "US", city: "New York",  isCurrentSession: false, createdAt: new Date(now.getTime() - 48 * 3600000) },
  ];
  for (const lh of loginHistoryEntries) {
    await prisma.loginHistory.upsert({ where: { id: lh.id }, update: {}, create: lh });
  }
  console.log("  ✅ Login history created");

  // ── Security Events ────────────────────────────────────────────────────────
  console.log("🔄 Creating security events...");
  const securityEvents = [
    { id: "se_001", type: "SUSPICIOUS_LOGIN",       ip: "203.0.113.99", userId: "user_regular",   severity: "MEDIUM", details: { reason: "New location" },          createdAt: new Date(now.getTime() - 1  * 86400000) },
    { id: "se_002", type: "BRUTE_FORCE",            ip: "198.51.100.1", userId: null,             severity: "HIGH",   details: { attempts: 12, email: "test@x.com" }, createdAt: new Date(now.getTime() - 2  * 86400000) },
    { id: "se_003", type: "RATE_LIMIT_EXCEEDED",    ip: "10.0.0.99",    userId: null,             severity: "LOW",    details: { endpoint: "/api/dictionary/search" }, createdAt: new Date(now.getTime() - 3  * 86400000) },
    { id: "se_004", type: "NEW_DEVICE_LOGIN",       ip: "192.168.2.50", userId: "user_admin",     severity: "LOW",    details: { device: "iPhone on iOS" },           createdAt: new Date(now.getTime() - 4  * 86400000) },
    { id: "se_005", type: "PASSWORD_CHANGE",        ip: "192.168.1.1",  userId: "admin_zolai_001",severity: "LOW",    details: {},                                    createdAt: new Date(now.getTime() - 7  * 86400000) },
    { id: "se_006", type: "ACCOUNT_LOCKED",         ip: "198.51.100.2", userId: "user_regular",   severity: "HIGH",   details: { reason: "Too many failed attempts" }, createdAt: new Date(now.getTime() - 10 * 86400000) },
  ];
  for (const se of securityEvents) {
    await prisma.securityEvent.upsert({
      where: { id: se.id },
      update: {},
      create: { ...se, type: se.type as never, severity: se.severity as never },
    });
  }
  console.log("  ✅ Security events created");

  // ── Security Alerts ────────────────────────────────────────────────────────
  console.log("🔄 Creating security alerts...");
  const securityAlerts = [
    { id: "sa_001", userId: "admin_zolai_001", type: "NEW_DEVICE_LOGIN",          title: "New device login",              message: "A new device logged into your account from Singapore.",    severity: "LOW",    isRead: false, createdAt: new Date(now.getTime() - 1  * 86400000) },
    { id: "sa_002", userId: "user_admin",       type: "SUSPICIOUS_LOGIN",          title: "Suspicious login attempt",      message: "Login from an unusual location was detected.",             severity: "MEDIUM", isRead: false, createdAt: new Date(now.getTime() - 2  * 86400000) },
    { id: "sa_003", userId: "user_regular",     type: "MULTIPLE_FAILED_LOGINS",    title: "Multiple failed login attempts",message: "5 failed login attempts were detected on your account.",   severity: "HIGH",   isRead: true,  createdAt: new Date(now.getTime() - 5  * 86400000) },
    { id: "sa_004", userId: "admin_zolai_001", type: "UNUSUAL_LOCATION_LOGIN",    title: "Login from new location",       message: "Your account was accessed from a new country.",            severity: "MEDIUM", isRead: true,  createdAt: new Date(now.getTime() - 7  * 86400000) },
  ];
  for (const sa of securityAlerts) {
    await prisma.securityAlert.upsert({
      where: { id: sa.id },
      update: {},
      create: { ...sa, type: sa.type as never, severity: sa.severity as never },
    });
  }
  console.log("  ✅ Security alerts created");

  // ── Posts ──────────────────────────────────────────────────────────────────
  console.log("🔄 Creating sample posts...");
  const posts = [
    { id: "post_001", type: "POST",  status: "PUBLISHED", slug: "introduction-to-zolai",       title: "Introduction to Zolai Language",       excerpt: "Learn the basics of the Zolai language.", contentHtml: "<p>Zolai (Tedim) is a Tibeto-Burman language spoken by the Zomi people.</p>", authorId: "user_content_admin", publishedAt: new Date(now.getTime() - 5  * 86400000), locale: "en" },
    { id: "post_002", type: "POST",  status: "PUBLISHED", slug: "zolai-phonology-guide",        title: "Zolai Phonology Guide",                excerpt: "A guide to Zolai sounds and pronunciation.", contentHtml: "<p>Zolai has a rich phonological system with tonal distinctions.</p>", authorId: "user_content_admin", publishedAt: new Date(now.getTime() - 10 * 86400000), locale: "en" },
    { id: "post_003", type: "POST",  status: "DRAFT",     slug: "zolai-grammar-overview",       title: "Zolai Grammar Overview",               excerpt: "SOV word order and more.", contentHtml: "<p>Draft content about Zolai grammar.</p>", authorId: "user_content_admin", publishedAt: null, locale: "en" },
    { id: "post_004", type: "NEWS",  status: "PUBLISHED", slug: "zolai-ai-v2-launch",           title: "Zolai AI v2 Launched",                 excerpt: "New model with improved accuracy.", contentHtml: "<p>We are excited to announce the launch of Zolai AI v2.</p>", authorId: "user_admin", publishedAt: new Date(now.getTime() - 3  * 86400000), locale: "en" },
    { id: "post_005", type: "PAGE",  status: "PUBLISHED", slug: "about",                        title: "About Zolai AI",                       excerpt: "Our mission and vision.", contentHtml: "<p>Zolai AI is dedicated to preserving the Zolai language through technology.</p>", authorId: "admin_zolai_001", publishedAt: new Date(now.getTime() - 30 * 86400000), locale: "en" },
  ];
  for (const p of posts) {
    await prisma.post.upsert({
      where: { type_slug_locale: { type: p.type as never, slug: p.slug, locale: p.locale } },
      update: {},
      create: { ...p, type: p.type as never, status: p.status as never },
    });
  }
  console.log("  ✅ Posts created");

  // ── Wiki Entries ───────────────────────────────────────────────────────────
  console.log("🔄 Creating wiki entries...");
  const wikiEntries = [
    { id: "wiki_001", slug: "sov-word-order",      title: "SOV Word Order",          category: "grammar",    content: "Zolai follows Subject-Object-Verb (SOV) word order. Example: Ka vai a om — I food eat.", tags: ["grammar", "syntax"] },
    { id: "wiki_002", slug: "tonal-system",         title: "Tonal System",            category: "phonology",  content: "Zolai has a tonal system with high, mid, and low tones that distinguish meaning.", tags: ["phonology", "tones"] },
    { id: "wiki_003", slug: "tedim-dialect",        title: "Tedim Dialect (ZVS)",     category: "dialect",    content: "The Tedim dialect (Zolai Verbal Standard) is the standardized form used in education.", tags: ["dialect", "standard"] },
    { id: "wiki_004", slug: "negation-patterns",    title: "Negation Patterns",       category: "grammar",    content: "Negation in Zolai uses 'kei' for conditional negation. Never use 'lo leh'.", tags: ["grammar", "negation"] },
    { id: "wiki_005", slug: "honorifics",           title: "Honorifics and Register", category: "culture",    content: "Zolai has distinct honorific forms for addressing elders and authority figures.", tags: ["culture", "register"] },
    { id: "wiki_006", slug: "vowel-system",         title: "Vowel System",            category: "phonology",  content: "Zolai has 7 vowels. The 'o' vowel is always /oʊ/, never pure /o/.", tags: ["phonology", "vowels"] },
  ];
  for (const w of wikiEntries) {
    await prisma.wikiEntry.upsert({ where: { slug: w.slug }, update: {}, create: { ...w, status: "published" } });
  }
  console.log("  ✅ Wiki entries created");

  // ── Subscribers ────────────────────────────────────────────────────────────
  console.log("🔄 Creating subscribers...");
  const subscribers = [
    { id: "sub_001", email: "subscriber1@example.com", name: "Subscriber One",   status: "CONFIRMED", token: "tok_sub_001", confirmedAt: new Date(now.getTime() - 10 * 86400000) },
    { id: "sub_002", email: "subscriber2@example.com", name: "Subscriber Two",   status: "CONFIRMED", token: "tok_sub_002", confirmedAt: new Date(now.getTime() - 5  * 86400000) },
    { id: "sub_003", email: "subscriber3@example.com", name: "Subscriber Three", status: "PENDING",   token: "tok_sub_003", confirmedAt: null },
    { id: "sub_004", email: "subscriber4@example.com", name: "Subscriber Four",  status: "CONFIRMED", token: "tok_sub_004", confirmedAt: new Date(now.getTime() - 20 * 86400000) },
    { id: "sub_005", email: "subscriber5@example.com", name: "Subscriber Five",  status: "UNSUBSCRIBED", token: "tok_sub_005", confirmedAt: new Date(now.getTime() - 30 * 86400000) },
  ];
  for (const s of subscribers) {
    await prisma.subscriber.upsert({
      where: { email: s.email },
      update: {},
      create: { ...s, status: s.status as never },
    });
  }
  console.log("  ✅ Subscribers created");

  // ── Notifications ──────────────────────────────────────────────────────────
  console.log("🔄 Creating notifications...");
  const notifications = [
    { id: "notif_001", userId: "admin_zolai_001", title: "New user registered",       description: "A new user has registered: user@zolai.space",    type: "user",     read: false, createdAt: new Date(now.getTime() - 1  * 3600000) },
    { id: "notif_002", userId: "admin_zolai_001", title: "Training run completed",    description: "qwen_zolai_7b_lora_v7 completed successfully.",   type: "training", read: false, createdAt: new Date(now.getTime() - 3  * 3600000) },
    { id: "notif_003", userId: "admin_zolai_001", title: "Comment flagged as spam",   description: "A comment on 'Introduction to Zolai' was flagged.", type: "moderation", read: true, createdAt: new Date(now.getTime() - 6  * 3600000) },
    { id: "notif_004", userId: "user_admin",       title: "Role updated",              description: "Your role has been updated to ADMIN.",             type: "role",     read: false, createdAt: new Date(now.getTime() - 12 * 3600000) },
    { id: "notif_005", userId: "user_moderator",   title: "New comment to moderate",   description: "A new comment is awaiting moderation.",            type: "moderation", read: false, createdAt: new Date(now.getTime() - 2  * 3600000) },
  ];
  for (const n of notifications) {
    await prisma.notification.upsert({ where: { id: n.id }, update: {}, create: n });
  }
  console.log("  ✅ Notifications created");

  // ── Summary ────────────────────────────────────────────────────────────────
  const [userCount, siteSettingCount, datasetStatCount, trainingRunCount, notifTemplateCount] = await Promise.all([
    prisma.user.count(),
    prisma.siteSetting.count(),
    prisma.datasetStat.count(),
    prisma.trainingRun.count(),
    prisma.notificationTemplate.count(),
  ]);

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Zolai AI seed completed!");
  console.log("=".repeat(50));
  console.log(`  - Users: ${userCount} (SUPER_ADMIN, ADMIN, CONTENT_ADMIN, MODERATOR, USER)`);
  console.log(`  - Site settings: ${siteSettingCount}`);
  console.log(`  - Dataset stats: ${datasetStatCount}`);
  console.log(`  - Training runs: ${trainingRunCount}`);
  console.log(`  - Notification templates: ${notifTemplateCount}`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
