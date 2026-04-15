import prisma from "../lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_SHORT_NAME,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_URL,
  DEFAULT_TWITTER_HANDLE,
  DEFAULT_TIMEZONE,
  DEFAULT_FOOTER_COPYRIGHT_TEXT,
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
    { id: "admin_zolai_001",   email: "admin@zolai.peterlianpi.site",     name: "Zolai Admin",     role: "SUPER_ADMIN"   },
    { id: "user_admin",         email: "admin2@zolai.peterlianpi.site",    name: "Admin",           role: "ADMIN"         },
    { id: "user_content_admin", email: "content@zolai.peterlianpi.site",   name: "Content Manager", role: "CONTENT_ADMIN" },
    { id: "user_moderator",     email: "moderator@zolai.peterlianpi.site", name: "Moderator",       role: "MODERATOR"     },
    { id: "user_regular",       email: "user@zolai.peterlianpi.site",      name: "Regular User",    role: "USER"          },
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
    { key: "site_creator", value: "Peter Lian Pi" },
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
