import { requireServerPermission } from "@/lib/auth/server-guards";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { forbidden } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireServerPermission(PERMISSIONS.ADMIN_PANEL);
  } catch {
    forbidden();
  }
  return <>{children}</>;
}
