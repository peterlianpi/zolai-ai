import { ClientLayout } from "./client-layout";
import { requireAuth } from "@/lib/auth/server";
import prisma from "@/lib/prisma";
import { UserPreferencesProvider } from "@/features/settings/hooks/use-table-pagination";
import { unstable_cache } from "next/cache";

const getUserPrefs = (userId: string) => unstable_cache(
  () => prisma.userPreferences.findUnique({
    where: { userId },
    select: { tablePagination: true },
  }),
  [`user-prefs-${userId}`],
  { revalidate: 300, tags: [`user-prefs-${userId}`] }
)();

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  let tablePagination: "infinite" | "normal" = "infinite";
  try {
    const prefs = await getUserPrefs(session.user.id);
    if (prefs?.tablePagination === "normal") tablePagination = "normal";
  } catch { /* use default */ }

  return (
    <UserPreferencesProvider initialTablePagination={tablePagination}>
      <ClientLayout>{children}</ClientLayout>
    </UserPreferencesProvider>
  );
}
