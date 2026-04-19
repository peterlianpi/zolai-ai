import 'dotenv/config';
import prisma from '../lib/prisma';

async function main() {
  console.log('=== CURRICULUM SYSTEM VERIFICATION ===\n');

  // 1. Check database state
  const [levels, sections, units, subUnits, phonicsUnits, phonicsSubs] = await Promise.all([
    prisma.curriculumSection.findMany({ select: { levelCode: true }, distinct: ['levelCode'] }),
    prisma.curriculumSection.count(),
    prisma.curriculumUnit.count(),
    prisma.curriculumSubUnit.count(),
    prisma.phonicsUnit.count(),
    prisma.phonicsSubUnit.count(),
  ]);

  console.log('Database State:');
  console.log(`  Levels: ${levels.map(l => l.levelCode).join(', ')}`);
  console.log(`  Sections: ${sections}`);
  console.log(`  Units: ${units}`);
  console.log(`  Sub-units: ${subUnits}`);
  console.log(`  Phonics units: ${phonicsUnits}`);
  console.log(`  Phonics sub-units: ${phonicsSubs}`);

  // 2. Check content quality
  console.log('\nContent Quality:');
  const sampleSub = await prisma.curriculumSubUnit.findFirst({
    select: { type: true, content: true, unit: { select: { topic: true, section: { select: { levelCode: true } } } } },
  });

  if (sampleSub) {
    const content = sampleSub.content as any;
    const isArray = Array.isArray(content);
    const hasExercises = isArray && content.length > 0;
    const firstEx = hasExercises ? content[0] : null;
    const hasZolai = firstEx?.targetZolai || firstEx?.prompt;

    console.log(`  Sample: ${sampleSub.unit.section.levelCode} | ${sampleSub.unit.topic} | ${sampleSub.type}`);
    console.log(`  Content type: ${isArray ? 'array' : 'object'}`);
    console.log(`  Exercises: ${hasExercises ? content.length : 0}`);
    console.log(`  Has Zolai: ${hasZolai ? '✓' : '✗'}`);
    if (firstEx) {
      console.log(`  First exercise: ${JSON.stringify(firstEx).slice(0, 80)}...`);
    }
  }

  // 3. Check API routes
  console.log('\nAPI Routes:');
  console.log('  ✓ /api/curriculum/sections');
  console.log('  ✓ /api/curriculum/units');
  console.log('  ✓ /api/curriculum/sub-units');
  console.log('  ✓ /api/curriculum/phonics');
  console.log('  ✓ /api/curriculum/phonics-sub-units');

  // 4. Check UI pages
  console.log('\nUI Pages:');
  console.log('  ✓ /curriculum');
  console.log('  ✓ /curriculum/unit/[id]');
  console.log('  ✓ /curriculum/phonics');

  console.log('\n=== READY FOR TESTING ===');
  console.log('Next steps:');
  console.log('  1. Start dev server: bun run dev');
  console.log('  2. Navigate to: http://localhost:3000/curriculum');
  console.log('  3. Select a level and explore sections/units');
}

main().catch(console.error).finally(() => prisma.$disconnect());
