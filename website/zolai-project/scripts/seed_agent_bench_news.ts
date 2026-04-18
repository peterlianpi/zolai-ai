import { prisma } from '../lib/prisma';

async function main() {
  const author = await prisma.user.findFirst(); 
  if (!author) {
    console.error("No author found. Please create a user first.");
    return;
  }

  const posts = [
    {
      title: "The Agentic Future: How Our AI Agents Learn Zolai",
      slug: "zolai-agentic-future-learning",
      type: "NEWS" as const,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-04-18T16:00:00Z"),
      contentHtml: `<p>Beyond just static datasets, the heart of Zomi AI lies in our <strong>Agentic Ecosystem</strong>. We aren't just training a model; we are building a suite of specialized agents that live alongside your data.</p>
      <p><strong>Meet the Team:</strong> From our <em>Zomi-Cleaner-Bot</em> which sanitizes incoming text in real-time, to our <em>Zomi-Synthesizer</em> generating high-quality instruction pairs, these agents act as a feedback loop. Every day, they analyze our datasets, flag non-compliant linguistic patterns, and help our core models stay aligned with the Tedim ZVS 2018 standards.</p>
      <p><strong>Why this matters:</strong> By distributing the workload to specialized agents, we achieve a level of precision that a single monolithic model cannot. Our grammar-checker doesn't just "guess"; it validates against the strict SOV (Subject-Object-Verb) grammar mandates we’ve baked into its memory.</p>`,
      excerpt: "An inside look at our agentic ecosystem: how specialized AI agents automate ZVS 2018 validation.",
      authorId: author.id,
    },
    {
      title: "Measuring Success: Our New Zolai Benchmarks",
      slug: "zolai-benchmark-launch",
      type: "NEWS" as const,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-04-18T17:00:00Z"),
      contentHtml: `<p>How do we know if our AI is truly speaking "Tedim"? We built a suite of rigorous evaluation benchmarks to prove it.</p>
      <p><strong>The Benchmarking Suite:</strong> We’ve introduced automated tests that specifically target the common pitfalls of Zolai NLP:</p>
      <ul>
        <li><strong>Plurality Check:</strong> Ensuring the model never pairs <em>i</em> with <em>uh</em>.</li>
        <li><strong>Standardization Test:</strong> Validating that compounds are correctly joined.</li>
        <li><strong>Conditionals Audit:</strong> Verifying that the model uses <em>kei leh</em> rather than non-standard forms.</li>
      </ul>
      <p>These benchmarks are now part of our CI/CD pipeline. Every time we fine-tune a model, it must pass these tests, ensuring that our AI remains a faithful steward of the Zolai language.</p>`,
      excerpt: "Introducing our automated linguistic benchmarks: the rigorous testing process ensuring our AI speaks authentic Tedim.",
      authorId: author.id,
    }
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }
  console.log("Agentic and benchmark posts seeded successfully.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());