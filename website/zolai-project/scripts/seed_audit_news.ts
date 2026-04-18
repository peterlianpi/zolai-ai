import { prisma } from '../lib/prisma';

async function main() {
  const author = await prisma.user.findFirst(); 
  if (!author) {
    console.error("No author found. Please create a user first.");
    return;
  }

  const posts = [
    {
      title: "Data Audit: Lessons Learned from Our Crawling Journey",
      slug: "zolai-crawl-data-audit-lessons",
      type: "NEWS" as const,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-04-18T14:00:00Z"),
      contentHtml: `<p>After processing thousands of web pages and scraping various Zomi community sources, our data audit has revealed profound insights into the state of digital Zolai.</p>
      <p><strong>What we faced:</strong> We encountered significant noise, including non-Tedim variants and inconsistent orthography. Handling fragmented encoding and varied metadata was our biggest hurdle.</p>
      <p><strong>What we learned:</strong> High-quality training data is not just about quantity; it is about <em>provenance</em>. We realized that Bible translations and verified linguistic datasets are the only true "Gold Standard" for ZVS 2018 compliance. Web-crawled news, while voluminous, requires a stricter multi-stage cleaning pipeline—specifically, our new audit-before-merge process—to ensure only pure Tedim Zolai reaches the master dataset.</p>`,
      excerpt: "Insights from our crawling pipeline: why verified data sources beat raw volume every time.",
      authorId: author.id,
    },
    {
      title: "Facing the Complexity: Linguistic Normalization Challenges",
      slug: "zolai-linguistic-normalization-challenges",
      type: "NEWS" as const,
      status: "PUBLISHED" as const,
      publishedAt: new Date("2026-04-18T15:00:00Z"),
      contentHtml: `<p>One of the hardest challenges in Zolai NLP is the normalization of informal digital text into the Tedim ZVS 2018 standard.</p>
      <p><strong>The Challenge:</strong> We face massive variance in spelling due to mobile-first typing—where compounds like <em>nasep</em> appear as <em>na sep</em>, and critical apostrophes (Pawfi) are frequently omitted.</p>
      <p><strong>Our Approach:</strong> We have developed custom regex-based normalization engines and language classifiers to detect and fix these issues before they reach the fine-tuning stage. Every script in our <code>/scripts/</code> directory is built to ensure that the final model "thinks" in pure Tedim. This is a rigorous, iterative process, but it is necessary for building an AI that our community can trust.</p>`,
      excerpt: "How we tackle non-standard spelling and informal orthography to achieve ZVS compliance.",
      authorId: author.id,
    }
  ];

  for (const post of posts) {
    await prisma.post.create({ data: post });
  }
  console.log("New audit and normalization posts seeded successfully.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());