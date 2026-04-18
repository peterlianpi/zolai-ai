import prisma from "../lib/prisma";

const now = new Date();
const AUTHOR = "admin_zolai_001";

const posts: Array<{
  type: "POST" | "PAGE" | "NEWS";
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
}> = [
  {
    type: "POST", slug: "who-are-the-zomi-people", title: "Who Are the Zomi People?",
    excerpt: "The Zomi are a Tibeto-Burman ethnic group from Chin State, Myanmar and northeast India — with a rich history tracing back to the legendary city of Ciimnuai.",
    contentHtml: "<h2>Who Are the Zomi?</h2><p><strong>Zomi</strong> (Zo + mi = \"Zo people\") are a Tibeto-Burman ethnic group whose ancestor is <strong>Zo</strong>. They primarily inhabit Chin State, Myanmar, Manipur and Mizoram in northeast India, and southeastern Bangladesh. A large diaspora of 12,000–15,000 lives in Tulsa, Oklahoma, USA — known as \"Zomi Town\".</p><p>They reject the colonial labels \"Kuki\" and \"Chin\" imposed during the British Raj, using <strong>Zomi</strong> as their self-designation since time immemorial.</p><h2>Origins</h2><p><strong>Ciimnuai</strong> is the legendary ancestral homeland — the \"Mother City\" and cradle of the Zomi clans. Pre-literate history was preserved through <em>La</em> (songs), <em>Pasaltit</em> (oral poetry), and <em>Khanggui</em> (genealogy records). Around AD 1420, the ancestors settled at Ciimnuai in the upper highlands. Around AD 1550, Pu Gui Mang founded Tedim — the cultural and linguistic center of the Zomi world.</p><h2>Language</h2><p>The Zolai (Tedim Zopau) language belongs to the Kuki-Chin branch of Tibeto-Burman (ISO 639-3: ctd). It uses a Latin script standardized through the ZVS (Zolai Vocabulary Standard) and is spoken by approximately 300,000–500,000 people across Myanmar, India, and the diaspora.</p>",
  },
  {
    type: "POST", slug: "zolai-language-history", title: "The History of the Zolai Language",
    excerpt: "From oral tradition to written standard — how Tedim Zolai evolved from ancient Tibeto-Burman roots to a modern written language with over 24,000 documented words.",
    contentHtml: "<h2>Language Identity</h2><p>Tedim Zolai (ISO 639-3: <code>ctd</code>) is a Kuki-Chin language of the Tibeto-Burman family. Word order is <strong>SOV</strong> (Subject-Object-Verb). It has mutual intelligibility with Paite, Sizang, and Zo dialects.</p><h2>Historical Development</h2><p>Before written records, Zolai history was preserved through <em>La</em> (songs) and <em>Khanggui</em> (genealogy). The first major written work was the <strong>Tedim 1932 Bible</strong>, followed by the <strong>Tedim 2010 revision</strong>. The ZVS standard (2018) formalized spelling and vocabulary.</p><h2>Standard Dialect</h2><p>The ZVS standard uses Tedim dialect forms: <code>pasian</code> (God), <code>gam</code> (land), <code>tapa</code> (son), <code>topa</code> (Lord), <code>kumpipa</code> (king), <code>tua</code> (that). These are the correct forms — never use <code>pathian</code>, <code>ram</code>, or <code>fapa</code>.</p><h2>Today</h2><p>The Zolai AI project has compiled over <strong>24,000 words</strong>, <strong>2 million sentences</strong>, and <strong>510 hymns</strong> to build the first AI system capable of understanding and generating fluent Tedim Zolai.</p>",
  },
  {
    type: "POST", slug: "zolai-grammar-basics", title: "Zolai Grammar: The Basics",
    excerpt: "An introduction to Zolai grammar — SOV word order, verb agreement markers, pronouns, and the negation system that makes Tedim Zolai unique.",
    contentHtml: "<h2>Word Order: SOV</h2><p>Zolai follows <strong>Subject-Object-Verb</strong> order: <em>Ka an ne hi</em> = I food eat (I eat food).</p><h2>Pronouns</h2><p>1st singular: <code>kei</code> / marker <code>ka</code> — <em>Ka pai hi</em> (I go). 2nd singular: <code>na'ng</code> / marker <code>na</code> — <em>Na pai hi</em> (You go). 3rd singular: <code>amah</code> / marker <code>a</code> — <em>A pai hi</em> (He/she goes). 1st plural: <code>keimahte</code> / marker <code>i</code> — <em>I pai hi</em> (We go).</p><h2>Negation</h2><p>Negation uses <code>kei</code> after the verb: <em>Ka pai kei hi</em> = I do not go. For conditionals: <em>nong pai kei a leh</em> = if you don't go. Never use <code>lo</code> for conditionals.</p><h2>Verb Endings</h2><p>Statements end with <code>hi</code>. Questions end with <code>maw</code>. The <code>ki-</code> prefix marks reflexive/reciprocal actions: <em>A ki mu hi</em> = He saw himself.</p>",
  },
  {
    type: "NEWS", slug: "zolai-ai-dataset-milestone", title: "Zolai AI Reaches 2 Million Sentence Milestone",
    excerpt: "The Zolai AI project has compiled over 2 million Zolai sentences and 24,000 dictionary entries — the largest digital corpus of the Tedim Zolai language ever assembled.",
    contentHtml: "<p>The Zolai AI project has reached a major milestone: <strong>2 million raw Zolai sentences</strong> compiled into the master corpus (574 MB), alongside a unified dictionary of <strong>152,000 entries</strong>.</p><h2>What We Have Built</h2><ul><li><strong>8.8 GB master corpus</strong> — the largest Zolai text dataset ever assembled</li><li><strong>24,000+ dictionary words</strong> with definitions, examples, and audio</li><li><strong>510 Tedim hymns</strong> digitized and structured</li><li><strong>5 Bible versions</strong> aligned in parallel (TB77, TBR17, Tedim1932, Tedim2010, KJV)</li><li><strong>105,000+ parallel ZO-EN translation pairs</strong></li></ul><h2>Next Steps</h2><p>We are fine-tuning open-source LLMs on this data to create the first AI that can understand and generate fluent Tedim Zolai. The goal: every Zomi person can learn, work, and interact with AI in their native tongue.</p>",
  },
  {
    type: "NEWS", slug: "tedim-bible-now-online", title: "Tedim Bible Now Available Online",
    excerpt: "All five versions of the Tedim Bible — TB77, TBR17, Tedim1932, Tedim2010, and KJV reference — are now available for reading and study on the Zolai platform.",
    contentHtml: "<p>The Zolai platform now hosts all five versions of the Tedim Bible in a parallel reader, allowing side-by-side comparison of translations.</p><h2>Available Versions</h2><ul><li><strong>TB77</strong> — Tedim Bible 1977</li><li><strong>TBR17</strong> — Tedim Bible Revised 2017</li><li><strong>Tedim1932</strong> — The original 1932 missionary translation</li><li><strong>Tedim2010</strong> — The modern standard translation</li><li><strong>KJV</strong> — King James Version (English reference)</li></ul><p>The Bible corpus contains <strong>31,102 verses</strong> across all books, fully aligned for linguistic research and devotional reading.</p>",
  },
  {
    type: "NEWS", slug: "zolai-dictionary-launch", title: "Zolai Dictionary: 24,000 Words Now Searchable",
    excerpt: "The Zolai Dictionary is now live with over 24,000 Zolai-English word pairs, definitions, part-of-speech tags, example sentences, and audio pronunciations.",
    contentHtml: "<p>The Zolai Dictionary is now publicly searchable. It contains:</p><ul><li><strong>24,000+ headwords</strong> with English translations</li><li><strong>Part-of-speech tags</strong> (noun, verb, adjective, adverb, particle)</li><li><strong>Example sentences</strong> from the Bible and news corpus</li><li><strong>Synonyms, antonyms, and related words</strong></li><li><strong>Bilingual explanations</strong> in both Zolai and English</li></ul><p>The dictionary was built from ZomiDictionary.com, ZomiMe app data, and TongDot dictionary — deduplicated and enriched with AI-generated definitions.</p>",
  },
  {
    type: "POST", slug: "zomi-culture-traditions", title: "Zomi Culture: Traditions and Heritage",
    excerpt: "From the Khuado harvest festival to traditional clan governance — an overview of Zomi cultural practices, music, and social structure.",
    contentHtml: "<h2>Social Structure</h2><p>Traditional Zomi society is organized around <strong>clans</strong> (phung) with a chief (lentang) at the head. The clan system traces lineage through the father's line. Key clans include Sukte, Kamhau, Siyin, Tedim, and Thado.</p><h2>Khuado Festival</h2><p>The <strong>Khuado</strong> (harvest festival) is the most important traditional celebration — a time of thanksgiving, feasting, and community gathering after the harvest. Traditional songs (<em>La</em>) and dances are performed.</p><h2>Music and Oral Tradition</h2><p>Zomi oral tradition is rich with <em>La</em> (songs), <em>Pasaltit</em> (warrior poetry), and <em>Khanggui</em> (genealogy recitation). The <strong>Gelhmaanbu</strong> is the traditional song of longing and remembrance. The Zolai AI project has digitized <strong>510 Tedim hymns</strong> as part of preserving this heritage.</p><h2>Christianity</h2><p>The majority of Zomi people are Christian, with Christianity arriving through British missionaries in the late 19th century. The church plays a central role in community life, education, and language preservation.</p>",
  },
];

async function main() {
  let created = 0;
  for (const p of posts) {
    const exists = await prisma.post.findFirst({ where: { slug: p.slug } });
    if (!exists) {
      await prisma.post.create({ data: { ...p, status: "PUBLISHED", locale: "en", publishedAt: now, authorId: AUTHOR } });
      created++;
    }
  }
  console.log(`✓ Created ${created} posts`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
