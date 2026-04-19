import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

export interface RedirectLookupResult {
  id: string;
  source: string;
  destination: string;
  statusCode: number;
}

const getEnabledRedirectRules = unstable_cache(
  async () => {
    return prisma.redirect.findMany({
      where: { enabled: true },
      select: {
        id: true,
        source: true,
        destination: true,
        statusCode: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
  ["enabled-redirect-rules"],
  {
    revalidate: 60,
    tags: ["redirects"],
  },
);

function isRegexPattern(source: string): boolean {
  return source.startsWith("/") && source.endsWith("/");
}

export async function lookupRedirect(url: string): Promise<RedirectLookupResult | null> {
  const rules = await getEnabledRedirectRules();

  const exactMatch = rules.find((rule) => rule.source === url);
  if (exactMatch) {
    return exactMatch;
  }

  const prefixMatch = rules.find((rule) => {
    if (!rule.source.endsWith("/*")) {
      return false;
    }

    const prefix = rule.source.slice(0, -2);
    return url.startsWith(prefix);
  });

  if (prefixMatch) {
    return prefixMatch;
  }

  for (const rule of rules) {
    if (!isRegexPattern(rule.source)) {
      continue;
    }

    try {
      const pattern = rule.source.slice(1, -1);
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(url)) {
        return rule;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function recordRedirectHit(id: string): void {
  void prisma.redirect
    .update({
      where: { id },
      data: {
        hitCount: { increment: 1 },
        lastHitAt: new Date(),
      },
    })
    .catch(() => {
      return undefined;
    });
}
