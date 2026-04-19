import { getServerSession } from "@/lib/auth/server";
import { forbidden } from "next/navigation";
import { AdminSystemPage } from "@/features/admin/components/admin-system-page";
import { isSuperAdmin } from "@/lib/auth/roles";

export default async function Page() {
  const session = await getServerSession();
  if (!isSuperAdmin(session?.user?.role)) forbidden();
  return <AdminSystemPage />;
}
