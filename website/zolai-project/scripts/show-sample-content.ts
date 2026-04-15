import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
  const types = ['INTRODUCTION','VOCABULARY','GRAMMAR','LISTENING','SPEAKING','READING','REVIEW','CHALLENGE'];
  for (const type of types) {
    const su = await prisma.curriculumSubUnit.findFirst({
      where: { type: type as never },
      select: { type: true, title: true, content: true, unit: { select: { topic: true, section: { select: { levelCode: true } } } } },
    });
    if (su) {
      const ex = (su.content as object[])[0];
      console.log(`\n=== ${type} | ${su.unit.section.levelCode} | ${su.unit.topic} ===`);
      console.log(JSON.stringify(ex, null, 2));
    }
  }

  const ph = await prisma.phonicsSubUnit.findFirst({
    where: { type: 'listen_identify' },
    select: { type: true, title: true, content: true, unit: { select: { category: true, title: true } } },
  });
  if (ph) {
    console.log(`\n=== PHONICS: ${ph.unit.category} | ${ph.unit.title} ===`);
    console.log(JSON.stringify((ph.content as object[])[0], null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
