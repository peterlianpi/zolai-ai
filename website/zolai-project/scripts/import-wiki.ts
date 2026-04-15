/**
 * scripts/import-wiki.ts
 * Imports all .md files from /home/peter/Documents/Projects/zolai/wiki/
 * into the WikiEntry table (upsert by slug).
 * Run: bunx tsx scripts/import-wiki.ts
 */
import 'dotenv/config';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, basename } from 'path';
import prisma from '../lib/prisma';

const WIKI_ROOT = '/home/peter/Documents/Projects/zolai/wiki';

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function collectFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...collectFiles(full));
    else if (entry.endsWith('.md')) results.push(full);
  }
  return results;
}

// Map folder name → WikiEntry category
const CATEGORY_MAP: Record<string, string> = {
  grammar: 'grammar',
  vocabulary: 'vocabulary',
  phonology: 'phonology',
  linguistics: 'linguistics',
  culture: 'culture',
  history: 'history',
  curriculum: 'curriculum',
  literature: 'literature',
  translation: 'translation',
  mistakes: 'grammar',       // common mistakes → grammar category
  particles: 'grammar',
  pronouns: 'grammar',
  negation: 'grammar',
  numbers: 'vocabulary',
  register: 'linguistics',
  glossary: 'vocabulary',
  biblical: 'culture',
  training: 'curriculum',
  planning: 'curriculum',
  features: 'reference',
  concepts: 'reference',
  patterns: 'grammar',
  decisions: 'reference',
  architecture: 'reference',
};

async function main() {
  const files = collectFiles(WIKI_ROOT);
  console.log(`Found ${files.length} wiki files`);

  let imported = 0, skipped = 0;

  for (const file of files) {
    const rel = relative(WIKI_ROOT, file);
    const folder = rel.split('/')[0];
    const category = CATEGORY_MAP[folder] ?? 'reference';
    const name = basename(file, '.md');
    const slug = slugify(`${folder}-${name}`);
    const content = readFileSync(file, 'utf-8');

    // Extract title from first # heading, fallback to filename
    const titleMatch = content.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : name.replace(/_/g, ' ');

    // Extract tags from content headings
    const tags = [...content.matchAll(/^##\s+(.+)/gm)]
      .map(m => slugify(m[1]))
      .slice(0, 5);

    try {
      await prisma.wikiEntry.upsert({
        where: { slug },
        update: { title, category, content, tags },
        create: { slug, title, category, content, tags, status: 'published' },
      });
      imported++;
    } catch (e) {
      console.error(`  ✗ ${slug}:`, e instanceof Error ? e.message : e);
      skipped++;
    }
  }

  console.log(`  ✓ ${imported} imported, ${skipped} skipped`);
  const total = await prisma.wikiEntry.count();
  console.log(`  Total WikiEntry rows: ${total}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
