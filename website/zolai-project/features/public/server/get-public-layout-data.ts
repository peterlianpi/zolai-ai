import { unstable_cache } from "next/cache";
import type { Menu } from "@/features/menus/types";
import type { SiteSetting } from "@/features/settings/types";
import prisma from "@/lib/prisma";
import { safeDbQuery } from "@/lib/server/safe-db";
import {
  PUBLIC_LAYOUT_CACHE_TAG,
  PUBLIC_LAYOUT_SETTING_KEYS,
  SITE_SETTINGS_CACHE_TAG,
} from "@/features/settings/server/constants";

export interface PublicLayoutData {
  menus: Menu[];
  siteSettings: SiteSetting[];
}

function normalizeTarget(target: string | null): "_blank" | "_self" | null {
  if (target === "_blank" || target === "_self") {
    return target;
  }

  return null;
}

const getCachedPublicLayoutData = unstable_cache(
  async (): Promise<PublicLayoutData> => {
    let menus: Array<{
      id: string;
      name: string;
      slug: string;
      location: string | null;
      items: Array<{
        id: string;
        parentId: string | null;
        label: string;
        url: string | null;
        target: string | null;
        classes: string | null;
        order: number;
        children: Array<{
          id: string;
          parentId: string | null;
          label: string;
          url: string | null;
          target: string | null;
          classes: string | null;
          order: number;
        }>;
      }>;
    }> = [];
    let siteSettings: SiteSetting[] = [];

    [menus, siteSettings] = await safeDbQuery({
      key: "public-layout-data",
      query: () =>
        Promise.all([
      prisma.menu.findMany({
        where: { location: { not: null } },
        select: {
          id: true,
          name: true,
          slug: true,
          location: true,
          items: {
            where: { parentId: null },
            select: {
              id: true,
              parentId: true,
              label: true,
              url: true,
              target: true,
              classes: true,
              order: true,
              children: {
                select: {
                  id: true,
                  parentId: true,
                  label: true,
                  url: true,
                  target: true,
                  classes: true,
                  order: true,
                },
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.siteSetting.findMany({
        where: {
          key: { in: [...PUBLIC_LAYOUT_SETTING_KEYS] },
        },
        select: {
          key: true,
          value: true,
        },
      }),
        ]),
      fallback: [[], []],
      timeoutMs: 3000,
      failureThreshold: 2,
      openMs: 30000,
      logLabel: "PublicLayout",
    });

    return {
      menus: menus.map((menu) => ({
        ...menu,
        items: menu.items.map((item) => ({
          ...item,
          url: item.url ?? "#",
          target: normalizeTarget(item.target),
          children: item.children.map((child) => ({
            ...child,
            url: child.url ?? "#",
            target: normalizeTarget(child.target),
          })),
        })),
      })),
      siteSettings,
    };
  },
  ["public-layout-data"],
  {
    revalidate: 60,
    tags: [PUBLIC_LAYOUT_CACHE_TAG, "menus", SITE_SETTINGS_CACHE_TAG],
  },
);

export async function getPublicLayoutData(): Promise<PublicLayoutData> {
  return getCachedPublicLayoutData();
}
