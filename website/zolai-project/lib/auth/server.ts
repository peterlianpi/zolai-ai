import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const getServerSession = async () => {
  try {
    const h = await headers();
    // Hono URL-encodes cookie values but Better Auth doesn't decode them.
    // Decode the cookie header before passing to auth.api.getSession().
    const rawCookie = h.get("cookie");
    if (rawCookie) {
      const decoded = rawCookie.replace(/([^=]+)=([^;]*)/g, (_, name, value) => {
        try { return `${name}=${decodeURIComponent(value)}`; } catch { return `${name}=${value}`; }
      });
      const patchedHeaders = new Headers(h);
      patchedHeaders.set("cookie", decoded);
      return await auth.api.getSession({ headers: patchedHeaders });
    }
    return await auth.api.getSession({ headers: h });
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
