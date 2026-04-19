import { redirect } from "next/navigation";
import { ClientLayout } from "./client-layout";
import { requireAuth } from "@/lib/auth/server";
import prisma from "@/lib/prisma";
import { UserPreferencesProvider } from "@/features/settings/hooks/use-table-pagination";
import { unstable_cache } from "next/cache";
import { getSiteSetting } from "@/lib/site-config";

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

  // Enforce global 2FA requirement from site settings (no restart needed)
  const require2fa = await getSiteSetting("require_2fa", "false");
  if (require2fa === "true" && !session.user.twoFactorEnabled) {
    redirect("/settings?tab=security&require2fa=1");
  }

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
