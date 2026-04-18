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
    { label: "sentences",        value: 5115356, target: 6000000, unit: "records" },
    { label: "parallel",         value: 105000,  target: 200000,  unit: "pairs"   },
    { label: "instructions",     value: 11000,   target: 50000,   unit: "records" },
    { label: "dictionary",       value: 152000,  target: 200000,  unit: "entries" },
    { label: "training_samples", value: 75000,   target: 5115356, unit: "samples" },
    { label: "hymns",            value: 510,     target: 1000,    unit: "records" },
  ];
  for (const stat of datasetStats) {
    await prisma.datasetStat.upsert({ where: { label: stat.label }, update: stat, create: stat });
  }
  console.log("  ✅ Dataset stats created");

  // ── Training Runs ──────────────────────────────────────────────────────────
  console.log("🔄 Creating training runs...");
  const trainingRuns = [
    {
      id: "run_qwen_zolai_7b_lora_v7",
      name: "qwen_zolai_7b_lora_v7",
      model: "Qwen2.5-7B",
      status: "complete",
      steps: 100,
      maxSteps: 100,
      startedAt: new Date("2025-11-01T00:00:00Z"),
      endedAt: new Date("2025-11-02T06:00:00Z"),
      config: { notes: "Early experiment — 7B too slow on T4" },
    },
    {
      id: "run_zolai_v1",
      name: "zolai_v1",
      model: "Qwen2.5-3B",
      status: "complete",
      steps: 500,
      maxSteps: 500,
      startedAt: new Date("2026-01-10T00:00:00Z"),
      endedAt: new Date("2026-01-12T18:00:00Z"),
      config: { notes: "Initial 3B run" },
    },
    {
      id: "run_zolai_qwen25_3b_chunk1",
      name: "zolai-qwen25-3b-chunk-0-25k",
      model: "Qwen2.5-3B-Instruct",
      status: "complete",
      steps: 782,
      maxSteps: 782,
      startedAt: new Date("2026-04-17T02:00:00Z"),
      endedAt: new Date("2026-04-17T04:15:00Z"),
      lossJson: JSON.stringify([{ step: 500, loss: 3.3243, eval_loss: 2.9856 }]),
      config: {
        chunk: "0-25000",
        adapter: "peterpausianlian/zolai-qwen2.5-3b-lora",
        batch_size: 4,
        max_length: 128,
        lora_r: 8,
        notes: "Session 1 — chunk 0–25k. Val loss 2.99",
      },
    },
    {
      id: "run_zolai_qwen25_3b_chunk2",
      name: "zolai-qwen25-3b-chunk-25k-50k",
      model: "Qwen2.5-3B-Instruct",
      status: "complete",
      steps: 782,
      maxSteps: 782,
      startedAt: new Date("2026-04-17T06:30:00Z"),
      endedAt: new Date("2026-04-17T08:49:00Z"),
      lossJson: JSON.stringify([{ step: 500, loss: 3.1365, eval_loss: 2.7398 }]),
      config: {
        chunk: "25000-50000",
        adapter: "peterpausianlian/zolai-qwen2.5-3b-lora",
        batch_size: 4,
        max_length: 128,
        lora_r: 8,
        notes: "Session 2 — chunk 25k–50k. Val loss 2.74",
      },
    },
    {
      id: "run_zolai_qwen25_3b_chunk3",
      name: "zolai-qwen25-3b-chunk-50k-75k",
      model: "Qwen2.5-3B-Instruct",
      status: "running",
      steps: 0,
      maxSteps: 782,
      startedAt: new Date("2026-04-17T11:37:00Z"),
      config: {
        chunk: "50000-75000",
        adapter: "peterpausianlian/zolai-qwen2.5-3b-lora",
        batch_size: 4,
        max_length: 128,
        lora_r: 8,
        notes: "Session 3 — chunk 50k–75k. In progress.",
      },
    },
  ];
  for (const run of trainingRuns) {
    await prisma.trainingRun.upsert({
      where: { id: run.id },
      update: run,
      create: run,
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

  // ── Experiment Journal Posts ───────────────────────────────────────────────
  console.log("🔄 Creating experiment journal posts...");
  const journalPosts = [
    {
      id: "post_journal_001",
      title: "Zolai AI Training Journey — Session 1: First Steps with QLoRA",
      slug: "zolai-ai-training-session-1",
      type: "POST" as const,
      status: "PUBLISHED" as const,
      locale: "en",
      excerpt: "Our first QLoRA fine-tuning session on Qwen2.5-3B-Instruct using 25k Zolai sentences. Val loss dropped to 2.99.",
      contentHtml: `<h1>Zolai AI Training Journey — Session 1</h1>
<h2>Ka lawm e! (Hello!)</h2>
<p>Today we completed our first QLoRA fine-tuning session for the Zolai AI Second Brain project.</p>
<h2>What We Did</h2>
<p>We fine-tuned <strong>Qwen2.5-3B-Instruct</strong> using QLoRA (4-bit NF4) on 25,000 Zolai sentences from our master corpus of 5.1M sentences.</p>
<h2>Results</h2>
<table><tr><th>Metric</th><th>Value</th></tr><tr><td>Steps</td><td>782</td></tr><tr><td>Training Loss</td><td>3.3243</td></tr><tr><td>Validation Loss</td><td>2.9856</td></tr><tr><td>Duration</td><td>~2h 15m</td></tr></table>
<h2>Model Output Test</h2>
<p>Input: <em>"Kei ka min Peter hi."</em><br/>Output: <em>"Kei ka min Peter hi. Ka khatna in, 'Khatna in, Peter, khatna in...'"</em></p>
<p>The model is generating Zolai! Still some repetition loops, but the language patterns are correct.</p>
<h2>Challenges</h2>
<ul><li>Gemma-3-4B had QLoRA bugs (token_type_ids + CUDA illegal memory access)</li><li>Dual T4 doesn't help — 4-bit models can't use DataParallel</li><li>Solution: single GPU mode with CUDA_VISIBLE_DEVICES=0</li></ul>
<h2>Next Steps</h2>
<p>Continue with chunk 25k–50k. Adapter saved to HuggingFace: <code>peterpausianlian/zolai-qwen2.5-3b-lora</code></p>
<p><em>Ka lawm e — Peter</em></p>`,
      authorId: "admin_zolai_001",
      publishedAt: new Date("2026-04-17T04:30:00Z"),
      isFeatured: true,
    },
    {
      id: "post_journal_002",
      title: "Session 2: Val Loss Drops to 2.74 — The Model is Learning Zolai",
      slug: "zolai-ai-training-session-2",
      type: "POST" as const,
      status: "PUBLISHED" as const,
      locale: "en",
      excerpt: "Second QLoRA session on chunk 25k–50k. Validation loss improved from 2.99 to 2.74. The Zolai patterns are sticking.",
      contentHtml: `<h1>Session 2: Val Loss 2.74 — Progress!</h1>
<h2>Tua hi! (That's it!)</h2>
<p>Session 2 complete. The model is clearly learning Zolai language patterns.</p>
<h2>Results</h2>
<table><tr><th>Session</th><th>Chunk</th><th>Val Loss</th><th>Improvement</th></tr><tr><td>1</td><td>0–25k</td><td>2.9856</td><td>baseline</td></tr><tr><td>2</td><td>25k–50k</td><td>2.7398</td><td>-0.25 ✓</td></tr></table>
<h2>Key Insight: Cumulative Learning</h2>
<p>Each session loads the previous adapter and trains on top of it. The adapter accumulates all learning — it's not starting fresh each time.</p>
<h2>Model Test</h2>
<p>Input: <em>"Kei ka min Peter hi."</em><br/>Output: <em>"Kei ka min Peter hi. Ka khatna ka hi..."</em></p>
<p>Better! <code>Ka khatna ka hi</code> is grammatically correct Zolai.</p>
<h2>Plan</h2>
<p>Increasing chunk size to 100k from session 4. At 3 sessions/week × 100k = 300k samples/week. Full 5.1M dataset coverage in ~17 weeks.</p>
<p><em>Peter</em></p>`,
      authorId: "admin_zolai_001",
      publishedAt: new Date("2026-04-17T09:00:00Z"),
      isFeatured: true,
    },
    {
      id: "post_journal_zo_001",
      title: "Zolai AI Training — Session 1 (Zolai)",
      slug: "zolai-ai-training-session-1-zo",
      type: "POST" as const,
      status: "PRIVATE" as const,  // Members only — Zolai language content
      locale: "zo",
      excerpt: "Zolai AI Second Brain project-a QLoRA fine-tuning session 1 hoih ta. Val loss 2.99 a si.",
      contentHtml: `<h1>Zolai AI Training — Session 1</h1>
<h2>Ka lawm e!</h2>
<p>Zolai AI Second Brain project-a training session 1 hoih ta hi.</p>
<h2>Tua Masa Beh</h2>
<p><strong>Qwen2.5-3B-Instruct</strong> model-a Zolai sentence 25,000 in training a nei hi. Ka corpus 5.1M sentence om hi, tua sung pan 25,000 lak in training a nei hi.</p>
<h2>Kizopna</h2>
<table><tr><th>Metric</th><th>Value</th></tr><tr><td>Steps</td><td>782</td></tr><tr><td>Training Loss</td><td>3.3243</td></tr><tr><td>Validation Loss</td><td>2.9856</td></tr><tr><td>Naai</td><td>~2h 15m</td></tr></table>
<h2>Model Test</h2>
<p>Input: <em>"Kei ka min Peter hi."</em><br/>Output: <em>"Kei ka min Peter hi. Ka khatna in, 'Khatna in, Peter...'"</em></p>
<p>Zolai a gen hi! Repetition om nawn hi, mahse Zolai pattern a zang hi.</p>
<h2>Khat Nawn</h2>
<p>Chunk 25k–50k in training a nei ding hi. Adapter HuggingFace-a save ta: <code>peterpausianlian/zolai-qwen2.5-3b-lora</code></p>
<p><em>Ka lawm e — Peter</em></p>`,
      authorId: "admin_zolai_001",
      publishedAt: new Date("2026-04-17T04:30:00Z"),
      isFeatured: false,
    },
  ];

  for (const post of journalPosts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: { title: post.title, excerpt: post.excerpt, contentHtml: post.contentHtml, status: post.status, publishedAt: post.publishedAt, isFeatured: post.isFeatured },
      create: post,
    });
  }
  console.log("  ✅ Experiment journal posts created");

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
