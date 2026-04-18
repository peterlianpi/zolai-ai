/**
 * scripts/fix-menus.ts
 * Upserts the primary public navigation menu.
 * Run: bun scripts/fix-menus.ts
 */
import "dotenv/config";
import prisma from "../lib/prisma";

const PRIMARY_ITEMS = [
  { label: "Dictionary", url: "/search",        order: 1 },
  { label: "Learn",      url: "/curriculum",    order: 2 },
  { label: "About",      url: "/about",         order: 3 },
  { label: "News",       url: "/news",          order: 4 },
  { label: "Resources",  url: "/resources",     order: 5 },
  { label: "Community",  url: "/community",     order: 6 },
  { label: "Help",       url: "/help",          order: 7 },
  { label: "Contact",    url: "/contact",       order: 8 },
];

const FOOTER_ITEMS = [
  { label: "About",          url: "/about",          order: 1 },
  { label: "Getting Started",url: "/getting-started",order: 2 },
  { label: "Recommended",    url: "/recommended",    order: 3 },
  { label: "Posts",          url: "/posts",          order: 4 },
  { label: "News",           url: "/news",           order: 5 },
  { label: "Contact",        url: "/contact",        order: 6 },
  { label: "Help",           url: "/help",           order: 7 },
];

async function upsertMenu(slug: string, name: string, location: string, items: typeof PRIMARY_ITEMS) {
  const menu = await prisma.menu.upsert({
    where: { slug },
    update: { name, location },
    create: { slug, name, location },
  });

  // Delete old items and recreate
  await prisma.menuItem.deleteMany({ where: { menuId: menu.id } });
  await prisma.menuItem.createMany({
    data: items.map(i => ({ menuId: menu.id, ...i })),
  });

  console.log(`  ✓ ${name} (${items.length} items)`);
}

async function main() {
  await upsertMenu("primary", "Primary Navigation", "primary", PRIMARY_ITEMS);
  await upsertMenu("footer", "Footer Navigation", "footer", FOOTER_ITEMS);
  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
