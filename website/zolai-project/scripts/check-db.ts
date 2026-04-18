import prisma from "../lib/prisma";
async function main() {
  const count = await prisma.vocabWord.count();
  const sample = await prisma.vocabWord.findMany({
    where: { zolai: { in: ["Innkuan","Sanggam","Khanggui","Tapa","Van"] } },
    select: { zolai: true, english: true, category: true }
  });
  console.log("Total in DB:", count);
  console.log("Sample:", JSON.stringify(sample, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
