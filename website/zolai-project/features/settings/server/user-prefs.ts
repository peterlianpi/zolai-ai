import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getUserPrefs = (userId: string) =>
  unstable_cache(
    () =>
      prisma.userPreferences.findUnique({
        where: { userId },
        select: { tablePagination: true },
      }),
    [`user-prefs-${userId}`],
    { revalidate: 300, tags: [`user-prefs-${userId}`] },
  )();
