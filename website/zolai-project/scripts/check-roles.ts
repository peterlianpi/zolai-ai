import prisma from "../lib/prisma";
async function main() {
  const users = await prisma.user.findMany({ select: { email: true, role: true } });
  console.table(users);
  await prisma.$disconnect();
}
main();
