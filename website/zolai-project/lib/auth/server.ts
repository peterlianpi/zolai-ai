import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const getServerSession = async () => {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
};

export const requireAuth = async (redirectTo?: string) => {
  const session = await getServerSession();
  if (!session?.user) {
    // Preserve the intended destination so login can redirect back
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";
    const dest = redirectTo || (pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login");
    redirect(dest);
  }
  return session;
};

export const requireNoAuth = async (redirectTo: string = "/dashboard") => {
  const session = await getServerSession();
  if (session?.user) redirect(redirectTo);
  return null;
};

import { isAdminRole } from "@/lib/auth/roles";

export const requireAdmin = async (redirectTo: string = "/dashboard") => {
  const session = await requireAuth();
  if (!isAdminRole(session.user.role)) redirect(redirectTo);
  return session;
};
