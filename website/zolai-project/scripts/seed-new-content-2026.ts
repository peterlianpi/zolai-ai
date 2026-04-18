import prisma from "../lib/prisma";

const now = new Date();
const AUTHOR = "admin_zolai_001";

const newContent: Array<{
  type: "POST" | "PAGE" | "NEWS";
  slug: string;
  title: string;
  publishedAt: Date;
  excerpt: string;
  contentHtml: string;
}> = [
  // ── NEWS ──────────────────────────────────────────────────────────────────
  {
    type: "NEWS",
    slug: "zolai-ai-training-pipeline-2026",
    title: "Zolai AI Training Pipeline: CPT → SFT → ORPO",
    publishedAt: new Date("2026-04-18"),
    excerpt: "The Zolai AI project has adopted a three-stage training pipeline — Continued Pretraining, Supervised Fine-Tuning, and ORPO alignment — to build the first fluent Tedim Zolai language model.",
    contentHtml: `<h2>Three-Stage Training Pipeline</h2>
<p>The Zolai AI project is now training its first large language model using a research-backed three-stage pipeline:</p>
<ol>
  <li><strong>Continued Pretraining (CPT)</strong> — Teaching the model Zolai token distributions from our 100M-token corpus. Target: validation loss &lt; 2.0.</li>
  <li><strong>Supervised Fine-Tuning (SFT)</strong> — Training on 50,000+ instruction pairs covering translation, grammar, QA, and daily conversation. Target: validation loss &lt; 1.5.</li>
  <li><strong>ORPO Alignment</strong> — Enforcing ZVS dialect standards using 2,000 preference pairs (correct Tedim vs wrong dialect). Target: ZVS compliance &gt; 95%.</li>
</ol>
<h2>Base Model: Qwen2.5-7B</h2>
<p>We selected <strong>Qwen2.5-7B-Instruct</strong> as our base model — the best open-source multilingual model available, supporting 29 languages under Apache 2.0 license. Research shows multilingual base models transfer significantly better to unseen low-resource languages than English-only models.</p>
<h2>Training Platform</h2>
<p>Training runs on <strong>Kaggle's free GPU tier</strong> (30 hours/week, 2× T4 GPUs = 32GB VRAM) using <strong>Unsloth</strong> — a framework that achieves 2× faster training with 70% less memory than standard HuggingFace implementations.</p>
<h2>Current Progress</h2>
<p>Three CPT sessions completed. Validation loss has dropped from 2.99 → 2.74 → 2.54. Target of &lt; 2.0 is on track for May 2026.</p>`,
  },
  {
    type: "NEWS",
    slug: "zolai-eval-benchmarks-built",
    title: "Zolai Evaluation Benchmarks Now Live",
    publishedAt: new Date("2026-04-18"),
    excerpt: "The Zolai project has built its first evaluation benchmarks: a 100-pair ZVS compliance test set, 500-pair translation eval, and 500-pair QA set — all derived from gold Tedim2010 data.",
    contentHtml: `<h2>Why Evaluation Matters</h2>
<p>Without benchmarks, there is no way to measure whether a model is improving. The Zolai project has now built three evaluation datasets entirely from existing gold-standard data:</p>
<ul>
  <li><strong>ZVS Compliance Test</strong> (100 pairs) — Tests whether the model uses correct Tedim ZVS dialect. Each pair has a correct sentence and a version with injected dialect violations (e.g., <em>pathian</em> instead of <em>pasian</em>). Gold correct sentences pass at 100%.</li>
  <li><strong>Translation Eval</strong> (500 pairs) — Held-out Tedim2010 Bible verses for measuring ZO↔EN translation quality using chrF and BLEU metrics.</li>
  <li><strong>QA Eval</strong> (500 pairs) — Question-answer pairs from the dictionary and parallel corpus, covering vocabulary, translation, and comprehension.</li>
</ul>
<h2>ORPO Preference Pairs</h2>
<p>We also built <strong>2,000 ORPO preference pairs</strong> for alignment training — each pair has a ZVS-correct "chosen" response and a dialect-wrong "rejected" response. Rule coverage: 54 pairs for pasian/pathian, 35 for gam/ram, 6 for tapa/fapa, and more.</p>
<h2>Run the Eval</h2>
<p>The evaluation runner is available at <code>scripts/evaluate_model.py</code>. Run it after any training session to get an instant ZVS compliance score.</p>`,
  },
  {
    type: "NEWS",
    slug: "zolai-data-corpus-stats-2026",
    title: "Zolai Data Corpus: Real Numbers (April 2026)",
    publishedAt: new Date("2026-04-18"),
    excerpt: "A transparent look at the actual data assets powering the Zolai AI — 5.6M training records, 105K parallel pairs, 64K dictionary entries, and more.",
    contentHtml: `<h2>Training Data</h2>
<table>
  <tr><th>Dataset</th><th>Records</th><th>Description</th></tr>
  <tr><td>final_train.jsonl</td><td>5,604,960</td><td>Full merged training set</td></tr>
  <tr><td>llm_train_v3.jsonl</td><td>3,667,728</td><td>Training split v3</td></tr>
  <tr><td>instructions_bible_v1.jsonl</td><td>50,000</td><td>Bible instruction pairs</td></tr>
  <tr><td>orpo_pairs_v1.jsonl</td><td>2,000</td><td>ORPO alignment pairs (new)</td></tr>
</table>
<h2>Parallel Corpus</h2>
<table>
  <tr><th>File</th><th>Pairs</th><th>Source</th></tr>
  <tr><td>zo_en_pairs_combined_v1.jsonl</td><td>105,511</td><td>All sources combined</td></tr>
  <tr><td>bible_parallel_tedim2010_kjv.jsonl</td><td>29,255</td><td>Gold ZVS standard</td></tr>
  <tr><td>bible_parallel_tdb77_kjv.jsonl</td><td>27,654</td><td>TDB77 1977</td></tr>
  <tr><td>bible_parallel_tbr17_kjv.jsonl</td><td>25,892</td><td>TBR17 2017</td></tr>
</table>
<h2>Dictionary</h2>
<table>
  <tr><th>File</th><th>Entries</th><th>Description</th></tr>
  <tr><td>dict_master_v1.jsonl</td><td>64,923</td><td>Merged master dictionary</td></tr>
  <tr><td>dict_enriched_v1.jsonl</td><td>24,891</td><td>With examples and context</td></tr>
  <tr><td>dict_unified_v1.jsonl</td><td>152,000</td><td>Raw unified (all sources)</td></tr>
</table>
<p>All data is stored in <code>data/</code> and versioned. The master corpus alone is 8.8 GB — the largest digital Zolai text collection ever assembled.</p>`,
  },
  {
    type: "NEWS",
    slug: "zolai-research-low-resource-nlp",
    title: "Research Roundup: Low-Resource NLP for Zolai (2025–2026)",
    publishedAt: new Date("2026-04-18"),
    excerpt: "Key research findings from 2024–2025 that directly inform the Zolai AI training strategy — from the UrduLLaMA blueprint to ORPO alignment and FineWeb2.",
    contentHtml: `<h2>The UrduLLaMA Blueprint</h2>
<p>The most directly applicable published work to Zolai is <strong>UrduLLaMA</strong> (arXiv:2502.16961). Researchers built a low-resource LLM for Urdu using: 128M tokens of continued pretraining + 41,000 instruction pairs + 50,000 translation pairs on Llama-3.1-8B. The Zolai project has comparable or better data.</p>
<h2>Quality Over Quantity</h2>
<p>Research (arXiv:2408.12780) confirms that <strong>diversity of training data matters more than raw quantity</strong> for low-resource languages. 10,000 diverse instruction pairs outperform 100,000 repetitive translation pairs. This is why we are expanding our synthetic data across 5 domains rather than just adding more Bible translations.</p>
<h2>ORPO: One-Pass Alignment</h2>
<p><strong>ORPO</strong> (Odds Ratio Preference Optimization, arXiv:2403.07691) combines supervised fine-tuning and preference alignment in a single training pass — eliminating the need for a separate DPO stage. This halves our compute requirements while achieving the same ZVS dialect enforcement.</p>
<h2>FineWeb2: 1000+ Languages</h2>
<p>HuggingFace's <strong>FineWeb2</strong> dataset covers 1,000+ languages from Common Crawl. We are checking whether any Tedim/Chin content is included — even 10,000 sentences would be significant for our pretraining corpus.</p>
<h2>CPT Is Critical</h2>
<p>Research (arXiv:2410.14815) shows continued pretraining before SFT gives <strong>+8–15 BLEU points</strong> for low-resource languages. Skipping CPT and going straight to instruction tuning is a common mistake that significantly limits model quality.</p>`,
  },
  {
    type: "NEWS",
    slug: "zolai-smart-goals-roadmap-2026",
    title: "Zolai AI Roadmap: SMART Goals Through August 2026",
    publishedAt: new Date("2026-04-18"),
    excerpt: "The Zolai project has set concrete, measurable goals with deadlines: a working LLM by June 2026, Telegram bot by July 2026, and Zolai-FLORES benchmark by August 2026.",
    contentHtml: `<h2>Goal 1: Train a Working Zolai LLM</h2>
<p><strong>Deadline: 2026-06-30</strong></p>
<p>Fine-tune Qwen2.5-7B using CPT→SFT→ORPO. Success metrics: validation loss &lt; 1.5, ZVS compliance &gt; 95% on 100-sentence test set.</p>
<ul>
  <li>2026-05-01 — CPT complete (val loss &lt; 2.0)</li>
  <li>2026-05-31 — SFT complete (val loss &lt; 1.5)</li>
  <li>2026-06-15 — ORPO complete (ZVS &gt; 95%)</li>
  <li>2026-06-30 — Model exported to GGUF, deployed locally</li>
</ul>
<h2>Goal 2: Build Evaluation Benchmarks</h2>
<p><strong>ZVS test set: 2026-05-15 ✅ (built April 2026)</strong><br>
<strong>Zolai-FLORES 1012 sentences: 2026-08-31</strong></p>
<h2>Goal 3: Expand Synthetic Data</h2>
<p><strong>Deadline: 2026-05-31</strong> — 50,000 instruction pairs across 5 domains: translation (10K), QA (10K), grammar (10K), daily life (10K), domain-specific (10K).</p>
<h2>Goal 4: Submit to SEACrowd</h2>
<p><strong>Deadline: 2026-05-01</strong> — Submit our 105K parallel pairs to the SEACrowd multilingual NLP community, putting Zolai on the map for Southeast Asian language research.</p>
<h2>Goal 5: Deploy Telegram Bot</h2>
<p><strong>Deadline: 2026-07-31</strong> — Deploy a Telegram bot running the trained model, accessible to the Zomi community worldwide. Success: 80% correct answers on 50 native-speaker test queries.</p>`,
  },
  {
    type: "NEWS",
    slug: "zolai-project-swot-audit-2026",
    title: "Zolai Project SWOT Audit: Strengths, Gaps, and Path Forward",
    publishedAt: new Date("2026-04-18"),
    excerpt: "An honest assessment of the Zolai AI project — what we do well, what's missing, and the concrete steps to close the gaps.",
    contentHtml: `<h2>Strengths</h2>
<ul>
  <li><strong>World-class linguistic documentation</strong> — Grammar, phonology, morphemics, verb stems, negation, and social registers all documented. Most low-resource language projects have none of this.</li>
  <li><strong>Exceptional data assets</strong> — 105K parallel pairs, 5.6M training records, 64K dictionary entries. Better than 95% of similar projects.</li>
  <li><strong>ZVS standard enforced</strong> — Every agent, script, and training example enforces the Tedim ZVS dialect. No contamination from Hakha/Falam.</li>
  <li><strong>Current research knowledge</strong> — Training strategy is based on 2024–2025 peer-reviewed research, not guesswork.</li>
</ul>
<h2>Gaps Being Addressed</h2>
<ul>
  <li><strong>Evaluation benchmarks</strong> — Now built: ZVS compliance test (100 pairs), translation eval (500 pairs), QA eval (500 pairs). ✅</li>
  <li><strong>SMART goals with deadlines</strong> — Now documented with full timeline through August 2026. ✅</li>
  <li><strong>Contributor onboarding</strong> — Guide now available for native speakers, developers, and researchers. ✅</li>
  <li><strong>Wiki changelog</strong> — All rule changes now logged with dates and reasons. ✅</li>
</ul>
<h2>Remaining Challenges</h2>
<ul>
  <li><strong>Native speaker validation</strong> — We need 3 native Tedim speakers to review model outputs. Contact us if you can help.</li>
  <li><strong>Synthetic data diversity</strong> — Current 11K synthetic instructions are 95% Bible domain. Expanding to medical, legal, tech, and daily life by May 2026.</li>
  <li><strong>Community resilience</strong> — Moving model weights to a shared HuggingFace organization account to reduce single-person dependency.</li>
</ul>`,
  },

  // ── POSTS ─────────────────────────────────────────────────────────────────
  {
    type: "POST",
    slug: "zvs-dialect-guide",
    title: "ZVS Dialect Guide: What Every Zolai Learner Must Know",
    publishedAt: new Date("2026-04-18"),
    excerpt: "The Zokam Standard Version (ZVS) defines the correct Tedim Zolai vocabulary. This guide explains which words to use and which to avoid — and why it matters for AI training.",
    contentHtml: `<h2>What Is ZVS?</h2>
<p>The <strong>Zokam Standard Version (ZVS)</strong> is the official orthographic and vocabulary standard for Tedim Zolai, established in 2018. It is based on the Tedim dialect — the linguistic center of the Zomi world — and is used in the Tedim2010 Bible, the most authoritative modern Zolai text.</p>
<h2>Core Vocabulary Rules</h2>
<table>
  <tr><th>Wrong (Non-ZVS)</th><th>Correct (ZVS)</th><th>Meaning</th></tr>
  <tr><td>pathian</td><td><strong>pasian</strong></td><td>God</td></tr>
  <tr><td>ram</td><td><strong>gam</strong></td><td>land, country</td></tr>
  <tr><td>fapa</td><td><strong>tapa</strong></td><td>son</td></tr>
  <tr><td>bawipa</td><td><strong>topa</strong></td><td>Lord</td></tr>
  <tr><td>siangpahrang</td><td><strong>pasian</strong></td><td>God (alternate)</td></tr>
  <tr><td>cu / cun</td><td><strong>tua</strong></td><td>that, then</td></tr>
  <tr><td>sanggin</td><td><strong>sanginn</strong></td><td>school</td></tr>
</table>
<h2>Negation Rules</h2>
<p>The negation system is one of the most important — and most commonly misused — aspects of Zolai grammar:</p>
<ul>
  <li><strong>Conditionals always use <code>kei</code></strong>: <em>Nong pai kei a leh</em> = If you don't come. Never <em>lo leh</em>.</li>
  <li><strong>1st/2nd person prefer <code>kei</code></strong>: <em>Ka dam kei hi</em> = I am not well.</li>
  <li><strong>3rd person past/state can use <code>lo</code></strong>: <em>Amah dam lo hi</em> = He/she is not well.</li>
  <li><strong>Absolute negation uses <code>kei lo</code></strong>: <em>Pasian dang kei lo</em> = There is no other God.</li>
</ul>
<h2>Why This Matters for AI</h2>
<p>The Zolai AI is trained exclusively on ZVS-standard text. Every training example is checked against these rules. The ORPO alignment stage specifically teaches the model to prefer ZVS forms over non-ZVS alternatives — ensuring the AI speaks authentic Tedim Zolai.</p>`,
  },
  {
    type: "POST",
    slug: "zolai-cefr-curriculum-overview",
    title: "Learning Zolai: A1 to C2 Curriculum Overview",
    publishedAt: new Date("2026-04-18"),
    excerpt: "The Zolai learning platform uses the CEFR framework (A1–C2) to structure language learning from basic greetings to poetic mastery. Here's what each level covers.",
    contentHtml: `<h2>The CEFR Framework for Zolai</h2>
<p>The Zolai learning platform structures language acquisition using the <strong>Common European Framework of Reference (CEFR)</strong>, adapted for Tedim Zolai. Each level builds on the previous, from basic identity to literary mastery.</p>
<h2>A1 — Beginner: Identity and Basics</h2>
<p>Core vocabulary: greetings, numbers, family terms, basic verbs. Grammar: simple SOV sentences, basic pronouns (<em>kei, na'ng, amah</em>), present tense. Example: <em>Ka min Peter hi. Ka Zomi hi.</em> (My name is Peter. I am Zomi.)</p>
<h2>A2 — Elementary: Narrative and Daily Life</h2>
<p>Past tense, prepositions, simple questions. Vocabulary: food, home, work, time expressions. Example: <em>Zingsang in ka sanginn ah ka pai hi.</em> (This morning I went to school.)</p>
<h2>B1 — Intermediate: Reasoning and Compound Sentences</h2>
<p>Conditional sentences, cause-effect, compound verbs. Vocabulary: emotions, nature, community. Example: <em>A pai ding ahih manin, a innkuan kiangah a om hi.</em> (Because he was going to leave, he stayed near his family.)</p>
<h2>B2 — Upper Intermediate: Conditionals and Comparisons</h2>
<p>Complex conditionals, comparatives, abstract concepts. Vocabulary: theology, governance, education. Example: <em>Nong it uh leh, nong it uh bang in na hawm ding uh hi.</em> (If you love, you will be loved as you love.)</p>
<h2>C1 — Advanced: Rhetoric and Register</h2>
<p>Formal register, rhetorical structures, sermon language. Vocabulary: biblical, legal, academic. Example: <em>Pasian' itna pen leitung ah a om teng tawh a kizang kei hi.</em> (The love of God is not comparable to anything in this world.)</p>
<h2>C2 — Mastery: Poetic and Literary</h2>
<p>Poetic parallelism, doxology, archaic forms. Vocabulary: hymns, proverbs, genealogy. Example: <em>Topa' min in zingsang leh zangkhat in a dawng hi.</em> (The name of the Lord resounds from morning to evening.)</p>`,
  },
  {
    type: "POST",
    slug: "how-to-contribute-zolai",
    title: "How to Contribute to the Zolai AI Project",
    publishedAt: new Date("2026-04-18"),
    excerpt: "The Zolai AI project needs native speakers, developers, and researchers. Here's how you can help preserve and digitize the Tedim Zolai language.",
    contentHtml: `<h2>We Need Native Speakers Most</h2>
<p>The most valuable contribution is <strong>native speaker validation</strong>. We need Tedim Zolai speakers to review AI-generated text and confirm it sounds natural and uses correct ZVS dialect. This takes 1–2 hours per week and can be done remotely.</p>
<p><strong>What you'll do:</strong></p>
<ul>
  <li>Review 20 AI-generated sentences per session</li>
  <li>Rate naturalness (1–5 scale)</li>
  <li>Flag dialect errors (e.g., <em>pathian</em> instead of <em>pasian</em>)</li>
  <li>Suggest corrections</li>
</ul>
<h2>For Developers</h2>
<p>The project is built with Python (data pipeline), Next.js (website), and FastAPI (dictionary API). Key areas where help is needed:</p>
<ul>
  <li>Data cleaning scripts (Python)</li>
  <li>Evaluation pipeline improvements</li>
  <li>Website features (Next.js + Prisma)</li>
  <li>Kaggle training notebooks</li>
</ul>
<h2>For Researchers</h2>
<p>We welcome collaboration on:</p>
<ul>
  <li>Low-resource NLP for Kuki-Chin languages</li>
  <li>Parallel corpus alignment methods</li>
  <li>Evaluation benchmark design</li>
  <li>Cross-lingual transfer learning</li>
</ul>
<p>Our 105K parallel pairs and 64K dictionary entries are available for research use. We are also submitting to <strong>SEACrowd</strong> (Southeast Asian NLP community) to make the data publicly accessible.</p>
<h2>Contact</h2>
<p>Reach us through the website contact form or find us on the Zomi community platforms. Every contribution — even reviewing 10 sentences — helps preserve the Zolai language for future generations.</p>`,
  },
  {
    type: "POST",
    slug: "zolai-second-brain-vision",
    title: "The Zolai Second Brain: Vision for Digital Language Sovereignty",
    publishedAt: new Date("2026-04-18"),
    excerpt: "Why the Zolai AI project is more than a translation tool — it's a digital stronghold ensuring the Tedim Zolai language thrives in the AI era.",
    contentHtml: `<h2>The Problem: Digital Neglect</h2>
<p>Tedim Zolai is absent from every major multilingual AI dataset — not in Google's mC4, Meta's FLORES-200, or any commercial translation API. When Zomi people use AI tools, they must use English or Burmese. Their mother tongue is invisible to the digital world.</p>
<h2>The Vision: Digital Sovereignty</h2>
<p>The <strong>Zolai AI Second Brain</strong> is a fully capable AI system that allows the Zomi people to learn, work, and interact with cutting-edge technology entirely in their native tongue. Not a translation tool — a <em>thinking partner</em> in Zolai.</p>
<h2>Five Pillars</h2>
<ol>
  <li><strong>The Digital Stronghold</strong> — A corpus so large (targeting 10M+ sentences) that no linguistic nuance is lost. Every article, hymn, and conversation becomes part of collective digital memory.</li>
  <li><strong>Linguistic Purity</strong> — The ZVS standard enforced at every level. The AI speaks authentic Tedim, not a dialect-mixed approximation.</li>
  <li><strong>The Sangsia (Teacher) Paradigm</strong> — An AI tutor that teaches Zolai using Socratic methods, adapting from A1 to C2, preserving the Lung-Kha (Heart-Spirit) framework of Zomi thought.</li>
  <li><strong>High Register Restoration</strong> — Digitizing biblical, literary, and poetic Zolai to prevent the "flattening" of vocabulary that comes with language loss.</li>
  <li><strong>Sovereign Models</strong> — The Zomi community owns its data, its model weights, and its AI future. No dependency on foreign corporations.</li>
</ol>
<h2>Where We Are Now</h2>
<p>As of April 2026: 5.6M training records, 105K parallel pairs, 64K dictionary entries, first LLM training in progress (val loss 2.54, target &lt; 1.5). First community deployment planned for July 2026.</p>
<p><em>Tua ahih ciangin, i Zolai i kepkeuna ding pen i mailam thu ahi hi.</em><br>
(Therefore, our preservation of Zolai is our future.)</p>`,
  },
];

async function main() {
  let created = 0;
  for (const p of newContent) {
    const exists = await prisma.post.findFirst({ where: { slug: p.slug } });
    if (!exists) {
      await prisma.post.create({
        data: {
          ...p,
          status: "PUBLISHED",
          locale: "en",
          authorId: AUTHOR,
        },
      });
      created++;
      console.log(`  ✓ ${p.type}: ${p.title}`);
    } else {
      console.log(`  – skip (exists): ${p.slug}`);
    }
  }
  console.log(`\nDone. Created ${created} new posts/news.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
