import { prisma } from '../lib/prisma';

async function list() {
  const posts = await prisma.post.findMany({ 
    where: { type: 'NEWS' }, 
    select: { title: true, publishedAt: true, slug: true } 
  });
  console.table(posts);
  await prisma.$disconnect();
}
list();