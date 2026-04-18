import { prisma } from '../lib/prisma';

async function main() {
  // Assuming 'ADMIN' is a valid author ID or you have a system user
  const author = await prisma.user.findFirst(); 
  if (!author) {
    console.error("No author found. Please create a user first.");
    return;
  }

  const posts = [
    {
      title: "The Zolai Second Brain: A Structural Restoration",
      slug: "zolai-structural-restoration-april-16",
      type: "NEWS" as const,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-04-16T10:00:00Z"),
      contentHtml: `<p>During the Maha Thingyan festival, our team initiated a comprehensive restoration of the "Zolai Second Brain" digital infrastructure.</p>
      <p>We transitioned from a fragmented collection of raw data to a unified architecture. Key milestones included:</p>
      <ul>
        <li><strong>Consolidation:</strong> Unified the Bible corpus, news crawls, and synthetic datasets into structured directories.</li>
        <li><strong>Standardization:</strong> Enforced Tedim ZVS 2018 standards, cleaning orthography (e.g., joined compounds like <em>nasep</em> and <em>leitung</em>).</li>
        <li><strong>Cleanup:</strong> Removed redundant files and standardized dictionary processing pipelines.</li>
      </ul>
      <p>This structural cleanup serves as the bedrock for our upcoming intelligence training phase, ensuring our datasets are high-purity and ZVS-compliant.</p>`,
      excerpt: "A deep dive into our holiday structural overhaul of the Zolai dataset and the enforcement of ZVS 2018 standards.",
      authorId: author.id,
    },
    {
      title: "Zolai NLP: Roadmap to Linguistic AI",
      slug: "zolai-nlp-roadmap-april-18",
      type: "NEWS" as const,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-04-18T10:00:00Z"),
      contentHtml: `<p>As we conclude the holiday break, Zomi AI is shifting focus from infrastructure maintenance to Intelligence Synthesis.</p>
      <p>Our roadmap for the next quarter is focused on three pillars:</p>
      <ol>
        <li><strong>Training-Ready Snapshots:</strong> Moving to high-purity, audited instruction datasets.</li>
        <li><strong>Agentic Deployment:</strong> Launching specialized linguistic agents for grammar checking and vocabulary building.</li>
        <li><strong>Model Training:</strong> Optimizing our pipeline for Kaggle-based LLM fine-tuning.</li>
      </ol>
      <p>We are building more than just a tool—we are creating an ecosystem where the Tedim Zolai language thrives in the AI era. Stay tuned for our upcoming benchmarks and training results.</p>`,
      excerpt: "Our strategic roadmap for the coming quarter: from training data readiness to the deployment of our native linguistic agents.",
      authorId: author.id,
    }
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }
  console.log("News posts seeded successfully.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
